import * as React from 'react';

import * as _ from 'lodash';

import SoulBreakList from '../components/soulBreaks/SoulBreakList';
import { SoulBreaksNav } from '../components/soulBreaks/SoulBreaksNav';
import UnmasteredSoulBreakAlert from '../components/soulBreaks/UnmasteredSoulBreakAlert';
import { Page } from './Page';

const soulBreakAnchor = (letter: string) => `soulBreaks-${letter}`;

interface State {
  showSearch: boolean;
  searchFilter: string;
}

export class SoulBreaksPage extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      showSearch: false,
      searchFilter: '',
    };
  }

  handleShowSearch = (show: boolean) => {
    this.setState({ showSearch: show });
  };

  // tslint:disable-next-line member-ordering
  handleSetSearchFilter = _.debounce((search: string) => {
    this.setState({ searchFilter: search });
  }, 400);

  render() {
    const isAnonymous = !process.env.IS_ELECTRON;
    const { showSearch, searchFilter } = this.state;
    return (
      <Page title="Soul Breaks">
        <SoulBreaksNav
          soulBreakAnchor={soulBreakAnchor}
          isAnonymous={isAnonymous}
          showSearch={showSearch}
          onShowSearch={this.handleShowSearch}
          onSetSearchFilter={this.handleSetSearchFilter}
        />

        {!isAnonymous && <UnmasteredSoulBreakAlert className="mt-2" />}
        <SoulBreakList
          letterAnchor={soulBreakAnchor}
          isAnonymous={isAnonymous}
          searchFilter={showSearch ? searchFilter : ''}
        />
      </Page>
    );
  }
}

export default SoulBreaksPage;
