jest.mock('reselect');
import { createSelector } from 'reselect';
import { __test__, create_view_map } from './core';

const noOp = () => {};

const { create_named_view, get_call_args } = __test__;

describe('computed views', () => {
  describe('creating a named computed view', () => {
    let view;
    let sut;
    let result;
    let resultFromView;
    let log;

    beforeEach(() => {
      view = jest.fn();
      view.recomputations = jest.fn();
      log = jest.fn();

      createSelector.mockReturnValue(view);
    });

    describe('view created when recomputation logging is enabled', () => {
      describe('when it is triggered', () => {
        beforeEach(() => {
          resultFromView = 42;
          sut = create_named_view({ name: 'Some View', args: [() => 1] }, { log, view_recomputations: true });
        });

        describe('and it causes a recomputation', () => {
          beforeEach(() => {
            view.mockReturnValue(resultFromView);
            view.recomputations.mockReturnValue(1);
          });

          beforeEach(() => {
            result = sut({});
          });

          it('logs the notice of recomputation', () => {
            expect(log).toHaveBeenCalled();
          });

          it('returns the result obtained by invoking the computed view', () => {
            expect(result).toEqual(resultFromView);
          });
        });

        describe('and it does not cause a recomputation', () => {
          beforeEach(() => {
            view.mockReturnValue(resultFromView);
            view.recomputations.mockReturnValue(0);
          });

          beforeEach(() => {
            result = sut({});
          });

          it('nothing is logged to the console', () => {
            expect(log).not.toHaveBeenCalled();
          });

          it('returns the result obtained by invoking the computed view', () => {
            expect(result).toEqual(resultFromView);
          });
        });
      });
    });

    describe('view created when recomputation logging is disabled', () => {
      beforeEach(() => {
        sut = create_named_view({ name: 'Some View', args: [() => 1] }, { log, view_recomputations: false });
      });

      it('is plain view built by reselect', () => {
        expect(sut).toEqual(view);
      });
    });
  });

  describe('getting the call arguments to the create view function', () => {
    let result;

    describe('when the first parameter is not a name', () => {
      let args = [noOp, noOp];

      beforeEach(() => {
        result = get_call_args(...args);
      });

      it('uses a generated name when the first parameter is not a name', () => {
        expect(result.name).toMatch(/1/);
      });

      it('original args are accessible', () => {
        expect(result.args).toEqual([noOp, noOp]);
      });
    });

    describe('when the first parameter is a name', () => {
      let name;
      let args = [noOp, noOp];

      beforeEach(() => {
        name = 'The name';
      });
      beforeEach(() => {
        result = get_call_args(...[name].concat(...args));
      });

      it('uses the provided name', () => {
        expect(result.name).toContain(name);
      });

      it('original args are accessible', () => {
        expect(result.args).toEqual([noOp, noOp]);
      });
    });
  });

  describe('creating a view map', () => {
    let accessors;
    let state;
    let result;
    let mapBuilder;

    beforeEach(() => {
      state = {};

      accessors = {
        name: jest.fn(),
        age: jest.fn(),
        calculateAValue: jest.fn()
      };
    });

    beforeEach(() => {
      accessors.name.mockReturnValue('John');
      accessors.age.mockReturnValue(42);
      accessors.calculateAValue.mockReturnValue(() => 42);
    });

    beforeEach(() => {
      mapBuilder = create_view_map(accessors);
    });

    beforeEach(() => {
      result = mapBuilder(state);
    });

    it('returns a map of pure getters that invoke the original functions to resolve the values', () => {
      expect(result.name).toEqual('John');
      expect(result.age).toEqual(42);
    });

    it('each accessor triggers an invocation of the original function, with the state tree', () => {
      expect(result.name).toEqual('John');
      expect(accessors.name).toHaveBeenCalledWith(state);
    });

    it('an accessor that resolves to a function is resolved correctly via the getter', () => {
      expect(result.calculateAValue).not.toBeNull();
      expect(accessors.calculateAValue).toHaveBeenCalledWith(state);
      expect(result.calculateAValue()).toEqual(42);
    });
  });
});
