import { WebContainer } from '@webcontainer/api';

let instance: WebContainer;

// UPDATED: Fixed code formatting/indentation
export async function getWebContainer() {
  if (!instance) {
    instance = await WebContainer.boot();
  }
  return instance;
}
