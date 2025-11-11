import { render, screen } from '@testing-library/react';
import { StatsProvider } from '../../context/StatsProvider';
import Pomodoro from './Pomodoro';

describe('Pomodoro component', () => {
	beforeEach(() => {
		localStorage.clear();
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('renders initial state', () => {
		render(
			<StatsProvider>
				<Pomodoro />
			</StatsProvider>
		);

		// default work minutes is 25 -> 25:00
		expect(screen.getByText(/25:00/)).not.toBeNull();
		expect(screen.getByRole('button', { name: /Start/i })).not.toBeNull();
	});
});
