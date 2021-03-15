import produce from 'immer';
import { useIntl } from 'react-intl';
import { createContext, FC, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { storageGet, storageSet, tryCatch, unsafeMutateDefaults } from '../../utils';
import { CategoryState, SortFilterHandler, SortFilterState, SortFilterStateValue } from './types';
import {
  buildCategory,
  getCategoryName,
  getInitialCategories,
  sortAndFilter,
  toHashList,
  getNormalizedCategory,
} from './utils';
import {
  apiV2SyncMaindata,
  Category,
  ServerState,
  SyncMaindata,
  Torrent,
  TorrentCollection,
  TorrentKeys,
} from '../../api';
import { useUiState } from './ui-state';
import perspective, {Table} from "@finos/perspective";

const TORRENT_SORT_KEY = 'torrentListSortFilter';

const initialServerState = {} as ServerState;
const initialCategoryState: CategoryState = {};
const initialTorrentsState = { collection: {}, hashList: [], viewHashList: [] } as {
  collection: TorrentCollection;
  hashList: string[];
  viewHashList: string[];
};
const initialTorrentSortFilterState: SortFilterStateValue = {
  column: 'priority',
  asc: true,
  search: '',
  category: '__all__',
};
const perspectiveWorker = perspective.shared_worker();
const tableProvider = perspectiveWorker.table({
	added_on: "integer",
	amount_left: "integer",
	auto_tmm: "boolean",
	availability: "float",
	category: "string",
	completed: "integer",
	completion_on: "datetime",
	content_path: "string",
	dl_limit: "integer",
	dlspeed: "integer",
	downloaded: "integer",
	downloaded_session: "integer",
	eta: "integer",
	f_l_piece_prio: "boolean",
	force_start: "boolean",
	hash: "string",
	last_activity: "datetime",
	magnet_uri: "string",
	max_ratio: "float",
	max_seeding_time: "integer",
	name: "string",
	num_complete: "integer",
	num_incomplete: "integer",
	num_leechs: "integer",
	num_seeds: "integer",
	priority: "integer",
	progress: "integer",
	ratio: "float",
	ratio_limit: "float",
	save_path: "string",
	seeding_time_limit: "integer",
	seen_complete: "integer",
	seq_dl: "boolean",
	size: "integer",
	state: "string",
	super_seeding: "boolean",
	tags: "string",
	time_active: "integer",
	total_size: "integer",
	tracker: "string",
	up_limit: "float",
	uploaded: "integer",
	uploaded_session: "integer",
	upspeed: "float"
	});

const initialGraphState = { 
    table: tableProvider,
}

const ServerContext = createContext(initialServerState);
const CategoryContext = createContext(initialCategoryState);
const TorrentsContext = createContext(initialTorrentsState);
const TorrentHashListContext = createContext(initialTorrentsState.hashList);
const TorrentViewHashListContext = createContext(initialTorrentsState.viewHashList);
const TorrentSortFilterContext = createContext(([
  initialTorrentSortFilterState,
  undefined,
] as unknown) as SortFilterState);
const GraphContext = createContext(initialGraphState);

export const AppContextProvider: FC = ({ children }) => {
  const intl = useIntl();
  const referenceId = useRef(0);
  const [sortFilterRefId, setSortFilterRefId] = useState(0);
  const [serverState, setServerState] = useState(initialServerState);
  const [categoryState, setCategoryState] = useState(initialCategoryState);
  const [torrentsState, setTorrentsState] = useState(initialTorrentsState);
  const [torrentSortFilterState, setTorrentSortState] = useState(
    unsafeMutateDefaults(initialTorrentSortFilterState)(
      storageGet(TORRENT_SORT_KEY, {} as SortFilterStateValue)
    )
  );
  const [graphState, setGraphState] = useState(initialGraphState);
  const torrentSortFilterStateRef = useRef(torrentSortFilterState);
  const categoryStateRef = useRef(categoryState);

  const [, { updateTorrentSelectionList }] = useUiState();

  const handleListSortFilter = useCallback<SortFilterHandler>(payload => {
    setTorrentSortState(s => {
      const { column, search, category } = payload;

      const updatedSort = produce(s, draft => {
        if (column) {
          if (draft.column === column) {
            draft.asc = !draft.asc;
          } else {
            draft.asc = true;
          }
          draft.column = column;
        }
        if (search != null) {
          draft.search = search;
        }
        if (category != null) {
          draft.category = category;
        }
      });
      updateTorrentSelectionList({ type: 'only', list: [] });

      return storageSet(TORRENT_SORT_KEY, updatedSort);
    });
  }, []);

  useEffect(() => {
    let tid: number | null = null;
    let nextFetchDelay = 1_000;

    async function fetchMaindata() {
      const sync = await tryCatch(() => apiV2SyncMaindata(referenceId.current), {} as SyncMaindata);
      const {
        rid,
        full_update,
        torrents = {},
        torrents_removed,
        server_state,
        categories,
        categories_removed,
      } = sync;

      if (rid) {
        referenceId.current = rid;

        if (torrents_removed && torrents_removed.length > 0) {
          setSortFilterRefId(Date.now());
          setTorrentsState(s =>
            produce(s, draft => {
              draft.hashList = draft.hashList.filter(hash => torrents_removed.indexOf(hash) < 0);
              torrents_removed.forEach(hash => {
                delete draft.collection[hash];
              });
            })
          );
        }

        const torrentHashes = Object.keys(torrents);
        const updatedCategories: Record<string, [string, boolean][]> = {};
        if (full_update) {
          // Mutate items and update hash property
          for (const hash in torrents) {
            torrents[hash].hash = hash;
          }
	  console.log(torrents);
	  const torrentValues = Object.values(torrents);
	  initialGraphState['table'].view().to_json().then((x) => {console.log(x)});
          //tableProvider.update(torrentValues);
	  /*
	  setGraphState({ 
	    table: tableProvider
          });
	  */

          setTorrentsState({
            collection: torrents as TorrentCollection,
            hashList: torrentHashes,
            viewHashList: [],
          });
          setSortFilterRefId(Date.now());
        } else if (torrentHashes.length > 0) {
	  console.log(torrents);
	  const torrentValues = Object.values(torrents);
	  initialGraphState['table'].view().to_json().then((x) => {console.log(x)});
	  /*
	  setGraphState({ 
	    table: tableProvider
          });
	  */
	  torrentHashes.forEach(hash => {
                const torrent = torrents[hash];
		torrent.hash = hash;

		//convert all the timestamps to milliseconds, or perspective doesn't read them
		if(typeof torrent.completion_on != "undefined") {
		torrent.completion_on *= 1000;
		}
		if(typeof torrent.last_activity != "undefined") {
		torrent.last_activity = torrent.last_activity*1000;
		}
		console.log(torrent);
		tableProvider.update([torrent]);
	  });
          setTorrentsState(s => {
            return produce(s, draft => {
              let shouldUpdateHashOrder = false;
              const collection = draft.collection;
              torrentHashes.forEach(hash => {
                const currentItem = collection[hash] as Torrent | undefined;
                const torrent = torrents[hash];
                if (currentItem) {
                  Object.entries(torrent).forEach(item => {
                    const [key, value] = item as [TorrentKeys, unknown];
                    if (key === 'category' && currentItem.category !== value && typeof value === 'string') {
                      const oldCategoryName = getNormalizedCategory(currentItem.category);
                      const newCategoryName = getNormalizedCategory(value);
                      const newCategorySet = updatedCategories[newCategoryName] || [];
                      const oldCategorySet = updatedCategories[oldCategoryName] || [];

                      newCategorySet.push([currentItem.hash, true]);
                      oldCategorySet.push([currentItem.hash, false]);

                      updatedCategories[oldCategoryName] = oldCategorySet;
                      updatedCategories[newCategoryName] = newCategorySet;
                    }
                    if (key === torrentSortFilterStateRef.current.column) {
                      shouldUpdateHashOrder = true;
                    }
                    currentItem[key] = value as never;
                  });
                } else {
                  shouldUpdateHashOrder = true;
                  draft.collection[hash] = { ...torrent, hash } as Torrent;
                  draft.hashList.push(hash);
                }

                if (shouldUpdateHashOrder) {
                  setSortFilterRefId(Date.now());
                }


              });
            });
          });
        }

        // Set category state
        if (full_update) {
          const updatedInitialCategoryState: CategoryState = Object.values(
            torrents as Record<string, Torrent>
          ).reduce((acc, torrent) => {
            const { hash, category: categoryStr } = torrent;

            const category: Category | undefined = categoryStr !== '' ? acc[categoryStr] : acc['__none__'];

            if (category) {
              category.hashList.push(hash);
            }
            acc['__all__'].hashList.push(hash);
            return acc;
          }, getInitialCategories(intl, categories));

          setCategoryState(updatedInitialCategoryState);
        } else {
          if (Object.keys(updatedCategories).length > 0 || categories || categories_removed) {
            setCategoryState(s => {
              const value = produce(s, draft => {
                if (categories_removed) {
                  categories_removed.forEach(categoryName => {
                    delete draft[categoryName];
                  });
                }
                const oldCategories = Object.values(draft);
                const newCategories = Object.entries(categories || {}).map(([name, category]) => {
                  const prev = draft[name] ? draft[name] : ({} as Category);
                  return buildCategory({
                    ...prev,
                    ...category,
                  });
                });
                oldCategories.concat(newCategories).forEach(category => {
                  const categoryName = getCategoryName(category);
                  const updates = updatedCategories[categoryName];
                  if (updates && updates.length > 0) {
                    updates.forEach(([hash, isAdding]) => {
                      const currentIndex = category.hashList.indexOf(hash);
                      if (isAdding && currentIndex < 0) {
                        category.hashList.push(hash);
                      } else if (!isAdding && currentIndex >= 0) {
                        category.hashList.splice(currentIndex, 1);
                      }
                    });
                  }
                  draft[categoryName] = category;
                });
              });

              setSortFilterRefId(Date.now());

              return value;
            });
          }
        }

        // Update Server state
        if (server_state) {
          if (full_update) {
            setServerState(server_state);
          } else {
            setServerState(s =>
              produce(s, (draft: any) => {
                for (const key in server_state) {
                  draft[key] = (server_state as any)[key];
                }
              })
            );
          }
        }
      } else {
        nextFetchDelay = 30_000;
      }

      tid = window.setTimeout(() => {
        fetchMaindata();
      }, nextFetchDelay);
    }

    fetchMaindata();

    return () => {
      if (tid) {
        window.clearTimeout(tid);
      }
    };
  }, []);

  useEffect(() => {
    categoryStateRef.current = categoryState;
  });

  useEffect(() => {
    torrentSortFilterStateRef.current = torrentSortFilterState;

    setTorrentsState(s => {
      const result = produce(s, draft => {
        draft.viewHashList = toHashList(
          sortAndFilter(torrentSortFilterState, Object.values(s.collection), categoryStateRef.current)
        );
      });
      return result;
    });
  }, [torrentSortFilterState, sortFilterRefId]);

  return (
    <ServerContext.Provider value={serverState}>
      <GraphContext.Provider value = {graphState}>
      <TorrentsContext.Provider value={torrentsState}>
        <TorrentHashListContext.Provider value={torrentsState.hashList}>
          <TorrentViewHashListContext.Provider value={torrentsState.viewHashList}>
            <TorrentSortFilterContext.Provider value={[torrentSortFilterState, handleListSortFilter]}>
              <CategoryContext.Provider value={categoryState}>{children}</CategoryContext.Provider>
            </TorrentSortFilterContext.Provider>
          </TorrentViewHashListContext.Provider>
        </TorrentHashListContext.Provider>
      </TorrentsContext.Provider>
      </GraphContext.Provider>
    </ServerContext.Provider>
  );
};

export const useServerState = () => {
  return useContext(ServerContext);
};

export const useTorrentsState = () => {
  return useContext(TorrentsContext);
};

export const useGraphState = () => {
  return useContext(GraphContext);
}

export const useTorrentList = () => {
  return useContext(TorrentHashListContext);
};

export const useTorrentViewList = () => {
  return useContext(TorrentViewHashListContext);
};

export const useTorrentSortFilterState = () => {
  return useContext(TorrentSortFilterContext);
};

export const useCategories = () => {
  return useContext(CategoryContext);
};
