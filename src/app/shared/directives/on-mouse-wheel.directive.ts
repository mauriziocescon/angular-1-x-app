import { Logger } from '../shared.module';

/**
 * Invoke a function when mousewheel event fires on the element
 *
 * example: <div mc-on-mouse-wheel="functionToCall(scrollLeft,scrollTop)"></div>
 */
export const mcOnMouseWheelDirective = () => {

  const directive: ng.IDirective = {};

  directive.priority = 0;
  directive.restrict = 'A';
  directive.link = (scope: ng.IScope, element: JQLite, attrs: ng.IAttributes) => {
    try {
      const mcOnMouseWheel = 'mcOnMouseWheel';
      const mousewheelHandler = scope.$eval(attrs[mcOnMouseWheel]);

      element.on('mousewheel DOMMouseScroll', mousewheelHandler());

      scope.$on('$destroy', (event: ng.IAngularEvent) => {
        element.off('mousewheel DOMMouseScroll');
      });
    } catch (e) {
      Logger.exception(scope, e);
    }
  };
  return directive;
};
