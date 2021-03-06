import { FormattedMessage } from 'react-intl';
import { TableColumn } from './types';

export const tableColumns: TableColumn[] = [
  { label: '#', dataKey: 'priority', width: 40, align: 'right' },
  {
    label: <FormattedMessage defaultMessage="Name" />,
    dataKey: 'name',
    width: 460,
  },
  { label: <FormattedMessage defaultMessage="Added On" />, dataKey: 'added_on', width: 160 },
  { label: <FormattedMessage defaultMessage="ETA" />, dataKey: 'eta', width: 120 },
  {
    label: <FormattedMessage defaultMessage="Ratio" />,
    dataKey: 'ratio',
    width: 70,
    align: 'right',
  },
  { label: <FormattedMessage defaultMessage="Progress" />, dataKey: 'progress', width: 120 },
  { label: <FormattedMessage defaultMessage="Status" />, dataKey: 'state', width: 160 },
  {
    label: <FormattedMessage defaultMessage="Size" />,
    dataKey: 'size',
    width: 80,
    align: 'right',
  },
  {
    label: <FormattedMessage defaultMessage="Total Size" />,
    dataKey: 'total_size',
    width: 100,
    align: 'right',
  },
  {
    label: <FormattedMessage defaultMessage="Seeds" />,
    dataKey: 'num_seeds',
    width: 80,
    align: 'right',
  },
  {
    label: <FormattedMessage defaultMessage="Peers" />,
    dataKey: 'num_leechs',
    width: 80,
    align: 'right',
  },
  {
    label: <FormattedMessage defaultMessage="Downloaded" />,
    dataKey: 'downloaded',
    width: 120,
    align: 'right',
  },
  {
    label: <FormattedMessage defaultMessage="Uploaded" />,
    dataKey: 'uploaded',
    width: 100,
    align: 'right',
  },
  {
    label: <FormattedMessage defaultMessage="Session Download" />,
    dataKey: 'downloaded_session',
    width: 100,
    align: 'right',
  },
  {
    label: <FormattedMessage defaultMessage="Session Upload" />,
    dataKey: 'uploaded_session',
    width: 100,
    align: 'right',
  },
  {
    label: <FormattedMessage defaultMessage="Down Speed" />,
    dataKey: 'dlspeed',
    width: 100,
    align: 'right',
  },
  {
    label: <FormattedMessage defaultMessage="Up Speed" />,
    dataKey: 'upspeed',
    width: 100,
    align: 'right',
  },
  {
    label: <FormattedMessage defaultMessage="Down Limit" />,
    dataKey: 'dl_limit',
    width: 100,
    align: 'right',
  },
  {
    label: <FormattedMessage defaultMessage="Up Limit" />,
    dataKey: 'up_limit',
    width: 100,
    align: 'right',
  },
  {
    label: <FormattedMessage defaultMessage="Share Limit" />,
    dataKey: 'ratio_limit',
    width: 200,
  },
  { label: <FormattedMessage defaultMessage="Category" />, dataKey: 'category', width: 160 },
  { label: <FormattedMessage defaultMessage="Tags" />, dataKey: 'tags', width: 280 },
  { label: <FormattedMessage defaultMessage="Time Active" />, dataKey: 'time_active', width: 160 },
  { label: <FormattedMessage defaultMessage="Last Activity" />, dataKey: 'last_activity', width: 160 },
  { label: '', dataKey: 'action', width: 40 },
];

export const getTableColumn = (index: number): TableColumn | null =>
  index >= 0 && index < tableColumns.length ? tableColumns[index] : null;

export const getColumnWidth: (p: { index: number }) => number = ({ index }) => {
  switch (index) {
    default:
      return tableColumns[index]?.width ?? 40;
  }
};

export const isFirstCell = (index: number) => index === 0;
export const isLastCell = (index: number) => index === tableColumns.length - 1;
