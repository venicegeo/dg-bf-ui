import {SOME_CONFIG_PROPERTY} from '../app/config';
import assert from 'assert';

describe('application config', () => {
  it('has a `SOME_CONFIG_PROPERTY` configuration', () => {
    assert.equal(SOME_CONFIG_PROPERTY, 'lorem ipsum');
  });
});
