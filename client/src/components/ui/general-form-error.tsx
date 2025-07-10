import {
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

import { UiState } from '@/lib/constants/ui-state';
import { cn } from '@/lib/utils/cn';

type Props = {
  submissionMessage: string;
  uiState: UiState;
};

const GeneralFormError = ({ submissionMessage, uiState }: Props) => {
  if (!submissionMessage) return null;

  return (
    <div className="flex h-full items-center gap-1">
      {uiState === UiState.Failure ? (
        <ExclamationCircleIcon className="h-5 w-5 text-danger-400" />
      ) : (
        <CheckCircleIcon className="h-5 w-5 text-success-400" />
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
