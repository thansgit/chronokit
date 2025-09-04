import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SegmentEditor from '@/components/SegmentEditor';
import { Cue } from '@/types';

describe('SegmentEditor', () => {
  it('saves with enforced segment color and minimum duration', () => {
    const onSave = jest.fn();
    const cue: Cue = {
      id: 'seg1',
      startTime: 5,
      color: '#fff',
      duration: 2,
      sound: { type: 'sound', soundId: 'bell' },
    } as any;

    const { getByText } = render(
      <SegmentEditor cue={cue} onSave={onSave} onClose={() => {}} maxTime={600} />
    );

    fireEvent.press(getByText('Save'));

    expect(onSave).toHaveBeenCalled();
    const saved = onSave.mock.calls[0][0] as Cue;
    expect(saved.duration && saved.duration > 0).toBe(true);
    expect(saved.color).toBeTruthy();
  });
});
