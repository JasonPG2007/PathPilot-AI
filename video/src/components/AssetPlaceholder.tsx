import {theme} from '../theme';

export const AssetPlaceholder = ({label, path}: {label: string; path: string}) => (
  <div className="asset-placeholder">
    <div className="asset-placeholder__mark">PP</div>
    <strong>{label}</strong>
    <span>Add this asset to:</span>
    <code>{`video-assets/${path}`}</code>
    <small style={{color: theme.inkMuted}}>The composition remains previewable until the file is added.</small>
  </div>
);
