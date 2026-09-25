import React from 'react';
import '../../styles/listing/ListingCreate.css';

export interface ListingCreateActionBarProps {
  note?: string;
  stepIndex?: number;
  totalSteps?: number;
  backLabel?: string;
  nextLabel?: string;
  nextDisabled?: boolean;
  secondaryLabel?: string;
  secondaryDisabled?: boolean;
  onBack?: () => void;
  onSecondary?: () => void;
  onNext?: () => void;
}

export const ListingCreateActionBar: React.FC<ListingCreateActionBarProps> = ({
  note = 'Hồ sơ được lưu nháp tự động sau mỗi thay đổi',
  stepIndex = 0,
  totalSteps = 5,
  backLabel = 'Quay lại',
  nextLabel = 'Bước kế tiếp',
  nextDisabled = false,
  secondaryLabel,
  secondaryDisabled = false,
  onBack,
  onSecondary,
  onNext,
}) => {
  return (
    <div className="rw-lc-actionbar">
      <div className="rw-lc-actionbar-inner">
      <div className="rw-lc-actionbar-note">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0f9d68" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="m8.5 12.3 2.4 2.4 4.6-5" />
        </svg>
        <span>
          <b>
            Bước {String(stepIndex + 1).padStart(2, '0')}/{String(totalSteps).padStart(2, '0')}
          </b>{' '}
          • {note}
        </span>
      </div>

      <div className="rw-lc-actionbar-btns">
        <button type="button" className="rw-lc-btn-ghost" onClick={onBack}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          {backLabel}
        </button>
        {secondaryLabel && (
          <button type="button" className="rw-lc-btn-ghost" onClick={onSecondary} disabled={secondaryDisabled}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
            {secondaryLabel}
          </button>
        )}
        <button type="button" className="rw-lc-btn-primary" onClick={onNext} disabled={nextDisabled}>
          {nextLabel}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      </div>
    </div>
  );
};

export default ListingCreateActionBar;
