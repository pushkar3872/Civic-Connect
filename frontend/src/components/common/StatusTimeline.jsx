const STEPS = [
  'NEW',
  'UNDER_REVIEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'COMPLETED_BY_WORKER',
  'REWORK_REQUIRED',
  'VERIFIED_BY_ADMIN',
  'CLOSED',
];

export default function StatusTimeline({ currentStatus }) {
  const currentIndex = STEPS.indexOf(currentStatus);

  return (
    <ul className="steps steps-vertical w-full">
      {STEPS.map((step, index) => {
        const isComplete = index <= currentIndex;
        const isCurrent = step === currentStatus;
        return (
          <li
            key={step}
            className={`step ${isComplete ? 'step-primary' : ''} ${isCurrent ? 'font-bold' : ''}`}
            data-content={isComplete ? '✓' : index + 1}
          >
            {step.replace(/_/g, ' ')}
          </li>
        );
      })}
    </ul>
  );
}
