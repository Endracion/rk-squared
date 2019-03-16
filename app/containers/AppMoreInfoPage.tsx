import * as React from 'react';

import { DonationInfo } from '../components/DonationInfo';
import { AppMoreInfo } from '../components/home/AppMoreInfo';
import { Page } from './Page';

export class AppMoreInfoPage extends React.Component {
  renderFooter = () => <DonationInfo />;

  render() {
    return (
      <Page title="The RK² App" footer={this.renderFooter}>
        <AppMoreInfo />
      </Page>
    );
  }
}

export default AppMoreInfo;
