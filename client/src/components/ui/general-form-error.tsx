import {
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { cn } from '@heroui/react';

import { UiState } from '@/lib/constants/ui-state';

type Props = {
  submissionMessage: string;
  uiState: UiState;
};

const GeneralFormError = ({ submissionMessage, uiState }: Props) => {
  if (!submissionMessage) return null;

  return (
    <div className="flex h-full items-center gap-1">
      {uiState === UiState.Failure ? (
        <ExclamationCircleIcon className="text-danger-400 h-5 w-5" />
      ) : (
        <CheckCircleIcon className="text-success-400 h-5 w-5" />
      )}
      <p
        className={cn('text-sm', {
          'text-danger-400': uiState === UiState.Failure,
          'text-success-400': uiState === UiState.Success
        })}
      >
        {submissionMessage}
      </p>
    </div>
  );
};

export default GeneralFormError;
