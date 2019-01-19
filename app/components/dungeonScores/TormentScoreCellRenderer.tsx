import * as React from 'react';

import { ICellRendererParams } from 'ag-grid';
import * as ReactTooltip from 'react-tooltip';

import {
  formatEstimatedScore,
  formatScore,
  isSub30,
  shouldUseEstimatedScore,
} from '../../actions/dungeonScores';
import { DungeonWithScore } from '../../selectors/dungeonsWithScore';
import { TormentScoreIcon } from './TormentScoreIcon';

export class TormentScoreCellRenderer extends React.Component<ICellRendererParams> {
  static ID = 'TORMENT_SCORE_CELL';

  componentDidMount() {
    ReactTooltip.rebuild();
  }

  render() {
    const { value } = this.props;
    const dungeon = value as DungeonWithScore;
    const useEstimated = shouldUseEstimatedScore(dungeon.score, dungeon.estimatedScore);
    const score = useEstimated ? dungeon.estimatedScore : dungeon.score;
    if (!score) {
      return null;
    }
    const showTooltips = !isSub30(score);
    return (
      <div data-tip={showTooltips ? dungeon.id : undefined} data-for={TormentScoreCellRenderer.ID}>
        {useEstimated ? formatEstimatedScore(score) : formatScore(score)}
        <TormentScoreIcon score={score} />
      </div>
    );
  }
}
