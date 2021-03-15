import { FC , useState } from 'react';
import { mStyles } from './common';
import { useAppVersionQuery } from './data';
import { MainLayout } from './layout';
import * as ReactDOM from "react-dom";
import Sidebar from './sidebar';
import TorrentsContainer from './torrents';
import { PerspectiveViewer } from './perspective-viewer';
import { useUiState } from './state';
import { TabPanel, TabContext } from '@material-ui/lab';

const useStyles = mStyles(() => ({
  torrentContainer: {
    width: '100%',
    flex: '1 0 auto',
  },
}));

export const App: FC = () => {
  const classes = useStyles();
  const { data: qbtVersion } = useAppVersionQuery();
  const [value, setValue] = useState('1');


  const handleTabChange = (event, newValue) => {
   setValue(newValue);
  };

  return (
    <TabContext value={value}>
    <MainLayout qbtVersion={qbtVersion || ''} sideBar={<Sidebar />} tabChangeHandler={handleTabChange}>
      <TabPanel value="1">
      <div className={classes.torrentContainer}>
        <TorrentsContainer />
      </div>
      </TabPanel>

      <TabPanel value="2">

        <PerspectiveViewer />
      </TabPanel>
    </MainLayout>
    </TabContext>
  );
};
