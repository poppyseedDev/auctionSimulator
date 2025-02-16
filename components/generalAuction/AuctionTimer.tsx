import { TimeLeft } from '@/hooks/use-countdown';

export function AuctionTimer({ ...timeLeft }: TimeLeft) {
  if (!timeLeft.isExpired)
    return (
      <div className={`text-center p-4 rounded-lg ${timeLeft.isExpired ? 'bg-red-100' : ''}`}>
        <h2 className="text-2xl font-bold mb-2">Time Remaining</h2>
        <div className={'text-4xl font-mono'}>
          {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:
          {String(timeLeft.seconds).padStart(2, '0')}
        </div>
      </div>
    );
}
