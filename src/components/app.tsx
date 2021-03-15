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
    height: '100%',
  },
  tabContainer: {
    height: '100%',
    }
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
      <div className={classes.torrentContainer}>
      <TabPanel value="1" className={classes.tabContainer}> 
        <TorrentsContainer />
      </TabPanel>

      <TabPanel value="2">

        <PerspectiveViewer />
      </TabPanel>
      </div>
    </MainLayout>
    </TabContext>
  );
};
