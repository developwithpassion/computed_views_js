import { createSelector } from 'reselect';
import { is_string } from '@developwithpassion/matchers_js';
import curry from '@developwithpassion/curry_js';

let unnamedCounter = 1;

const get_call_args = (...args) =>
  is_string(args[0]) ? { name: `**** ${args.shift()} ****`, args } : { name: `${unnamedCounter++}`, args };

/**
 * Utility function used solely by this module that will create a named computed view.
 * If the configuration is setup to log viewRecomputations then whenever the view is recomputed it will
 * dump recomputation details to the console for the purpose of letting the developer get an idea
 * of where they might have excessive recomputations happening in the ui.
 */
// eslint-disable-next-line no-console
const create_named_view = (
  { name, args },
  { log = console.log.bind(console), view_recomputations = true }
) => {
  const view = createSelector(...args);

  if (!view_recomputations) return view;

  let last_recomputation_count = 0;

  return state => {
    const result = view(state);
    const computations = view.recomputations();

    if (last_recomputation_count !== computations) {
      log(`${name} - Recomputations: ${last_recomputation_count} => ${computations}`);
      last_recomputation_count = computations;
    }
    return result;
  };
};
/**
 *
 * This is the default export that maintains the existing signature of creating a computed
 * view without specifying a name. When no name is provided
 * the name of the computed view will be based on the current value of the unnamedCounter.
 * @example <caption>Create an unnamed computed view</caption>
 * import view from 'lib/computedViews';
 *
 * //following code creates a simple state tree
 * //this would typically occure elsewhere in the application, but is included here for the sake of
 * //helping with understanding
 *
 * const state = ({ val: 42 })
 * const someView = view(({ val}) => val, x => x)
 * const result = someView(state); // 42
 *
 */
export default (...args) => create_named_view(get_call_args(...args));

/**
 * This should be the preferred mechanism for creating a view
 * builder that will be used on a per module basis to create computed views.
 * It is meant to be used in conjunction with the { fileAbsolute } macro
 * from 'paths.macro' to ensure that the name of the file where
 * the computed view is defined will become part of the name of the computed
 * view itself. This is useful for be able to know which
 * computed views need to be changd in the case of identifying excessive recomputations.
 *
 * @example <caption>Creating a view builder bound to a file</caption>
 * import { fileAbsolute } from 'paths.macro'
 * import { create_view_builder } from 'lib/computedViews';
 *
 * //The view field is now a factory specific to this file for creating computed views
 * //that are also tagged with the full name of the current file
 * const view = create_view_builder(fileAbsolute)
 * //
 * //inside the file we can use the view field to create named or unnamed computed views
 * //as we wish
 *
 * @example <caption>Creating a named view with a local view builder</caption>
 * const someView = view('A name that will help me trace', selector1)
 *
 * @example <caption>Creating an unnamed view with a local view builder</caption>
 * const someView = view(selector1)
 */
export const create_view_builder = curry(
  ({ log = console.log.bind(log), view_recomputations = true }, prefix) => (...args) => {
    const { name, args: realArgs } = get_call_args(...args);

    return create_named_view(
      {
        name: `[${prefix}] - ${name}`,
        args: realArgs
      },
      { log, view_recomputations }
    );
  }
);

/**
 * This is a utility function to create an object that contains pure getters
 * that can be consumed directly by the view.
 *
 * @example <caption>Creating a view map</caption>
 * import { fileAbsolute } from 'paths.macro'
 * import { create_view_builder, createViewMap } from 'lib/computedViews';
 *
 * //The view field is now a factory specific to this file for creating computed views
 * //that are also tagged with the full name of the current file
 * const view = create_view_builder(fileAbsolute)
 * //
 * //inside the file we can use the view field to create named or unnamed computed views
 * //as we wish
 *
 * @example <caption>Creating a named view with a local view builder</caption>
 * const someView = view('A name that will help me trace', selector1)
 * const someOtherView = view('Another name that will help me trace', selector2)
 *
 * @example <caption>Create an accessor map where each key will become a getter on the created
 * view map</caption>
 * const accessors = {
 *  someView,
 *  someOtherView
 * };
 *
 * export const createComputedViews = createViewMap(accessors);
 *
 */
export const create_view_map = accessors => state =>
  Object.entries(accessors).reduce((acc, [key, accessor]) => {
    Object.defineProperty(acc, key, {
      get() {
        return accessor(state);
      },
      writeable: false,
      enumerable: true,
      configurable: false
    });
    return acc;
  }, {});

export const __test__ = {
  create_named_view,
  get_call_args
};
