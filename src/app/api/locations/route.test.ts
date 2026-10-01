import test from 'node:test';
import assert from 'node:assert/strict';
import { collectBengaliLocationLabels } from '../../../lib/location-labels.ts';

test('Bengali labels prioritize dataset names and include nested locations', () => {
  const upstreamLabels = new Map([
    ['kotwali', 'upstream label'],
    ['pahartali', 'পাহাড়তলী'],
  ]);
  const labels = collectBengaliLocationLabels([
    { name: 'Kotwali', bnName: 'কোতোয়ালী' },
    { name: 'Double Mooring' },
    { name: 'Pahartali' },
    { name: 'Chattogram', bnName: 'চট্টগ্রাম', districts: [{ name: 'Bandarban', bnName: 'বান্দরবান' }] },
  ], upstreamLabels);

  assert.equal(labels.Kotwali, 'কোতোয়ালী');
  assert.equal(labels['Double Mooring'], 'ডবলমুরিং');
  assert.equal(labels.Pahartali, 'পাহাড়তলী');
  assert.equal(labels.Chattogram, 'চট্টগ্রাম');
  assert.equal(labels.Bandarban, 'বান্দরবান');
});
