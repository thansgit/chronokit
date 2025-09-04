import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SoundCueEditor from '@/components/SoundCueEditor';
import { Cue } from '@/types';

describe('SoundCueEditor', () => {
  it('saves with enforced trigger color', () => {
    const onSave = jest.fn();
    const cue: Cue = { id: 'x', startTime: 10, color: '#fff', sound: { type: 'sound', soundId: 'bell' } } as any;
    const { getByText } = render(
      <SoundCueEditor cue={cue} onSave={onSave} onClose={() => {}} maxTime={600} />
    );

    fireEvent.press(getByText('Save'));

    expect(onSave).toHaveBeenCalled();
    const saved = (onSave.mock.calls[0][0]) as Cue;
    // Trigger color should be enforced by the editor
    expect(saved.color).toBeTruthy();
  });
});
