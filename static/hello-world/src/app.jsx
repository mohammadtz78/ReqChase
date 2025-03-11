import { useState, useEffect } from 'react';
import { view } from '@forge/bridge';

import 'rsuite/dist/rsuite.min.css';
import IssueWidget from './IssueWidget';
import GlobalPageRouter from './globalPageRouter';

const App = () => {

  const [location, setLocation] = useState(null);

  useEffect(() => {
    init()
  })

  const init = async () => {
    const context = await view.getContext()
    setLocation(context.extension.type)
  }

  return (
    <>
      {location === 'jira:globalPage' && <GlobalPageRouter />}
      {location === 'jira:issuePanel' && <IssueWidget />}
    </>

  );
};

export default App;