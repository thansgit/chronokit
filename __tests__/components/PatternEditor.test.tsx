import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PatternEditor from '@/components/PatternEditor';
import { Cue } from '@/types';

describe('PatternEditor', () => {
  it('saves with phases and repeat structure (defaults)', () => {
    const onSave = jest.fn();

    const { getByText } = render(
      <PatternEditor cue={null} onSave={onSave} onClose={() => {}} maxTime={600} />
    );

    // Default state has one phase, clicking Save should call onSave with phases
    fireEvent.press(getByText('Save'));

    expect(onSave).toHaveBeenCalled();
    const saved = onSave.mock.calls[0][0] as Cue;
    expect(Array.isArray(saved.phases)).toBe(true);
    expect(saved.phases && saved.phases.length).toBeGreaterThan(0);
    expect(saved.startTime).toBeGreaterThanOrEqual(0);
    expect(saved.color).toBeTruthy();
  });
});
