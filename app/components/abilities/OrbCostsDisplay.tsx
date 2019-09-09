import * as React from 'react';

import * as classNames from 'classnames';

import { OrbCost } from '../../data/orbDetails';

const styles = require('./OrbCostsDisplay.scss');

interface Props {
  costs: OrbCost[];
  baseRarity: number;
}

export class OrbCostsDisplay extends React.Component<Props> {
  render() {
    const { costs } = this.props;
    return (
      <>
        {costs.map((cost, i) => (
          <React.Fragment key={i}>
            <span className={classNames(styles.component, cost.orbType.toLowerCase())}>
              {cost.cost}
            </span>
            {i + 1 < costs.length ? ', ' : ''}
          </React.Fragment>
        ))}
      </>
    );
  }
}
