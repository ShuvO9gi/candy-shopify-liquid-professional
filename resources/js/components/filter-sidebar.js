import { component } from 'picoapp';
import Tabify from '../utils/Tabify';

export default component((node) => {
  const toggles = node.querySelectorAll('[data-filter-toggle]');
  const wrappers = node.querySelectorAll('[data-filter-wrapper]');
  const icons = node.querySelectorAll('[data-filter-icon]');

  (() => new Tabify(toggles, wrappers, icons))();
});
