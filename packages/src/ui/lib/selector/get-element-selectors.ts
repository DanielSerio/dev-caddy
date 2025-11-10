function getRawQueryString<Elm extends HTMLElement>(elm: Elm) {
  const tag = elm.tagName;
  const id = elm.id;
  const classes = elm.classList.toString();

  if (id) {
    return `${tag}#${id}`;
  }

  return `${tag}${classes ? `.${classes.split(/\s/g).join('.')}` : ''}`;
}



function findIndex<Elm extends HTMLElement>(parent: HTMLElement, elm: Elm) {
  const array = Array.from(parent.children);

  return array.findIndex((child) => Object.is(elm, child));
}

function getCompressedQueryString<Elm extends HTMLElement>(elm: Elm) {
  const tag = elm.tagName;

  let nth = 0;

  if (elm.parentElement) {
    nth = findIndex(elm.parentElement, elm);
  }

  return `${tag}[${nth}]`;
}

function getCompressedElementTree<RootElm extends HTMLElement, Elm extends HTMLElement>(root: RootElm, elm: Elm) {
  const pathSegments: string[] = [];

  let currentNode: HTMLElement | null = elm;

  while (currentNode && !Object.is(root, currentNode)) {
    const queryString = getCompressedQueryString(currentNode);

    pathSegments.push(queryString);

    currentNode = currentNode.parentElement;
  }

  pathSegments.push('body');

  return pathSegments.reverse().join('>');
}

/**
 * Retrieves the annotation selectors and information about a given HTML element and its parent 
 * within a specified root element.
 * @param {Elm} elm - The `elm` parameter in the `getElementSelectors` function represents the HTML
 * element for which you want to generate selectors.
 * @param {RootElm} root - The `root` parameter in the `getElementSelectors` function is used to
 * specify the root element within which the target element (`elm`) is located. By default, if no
 * `root` element is provided, the function will use the `document.body` element as the root.
 */
export function getElementSelectors<RootElm extends HTMLElement, Elm extends HTMLElement>(elm: Elm, root: RootElm = document.body as RootElm) {
  const tag = elm.tagName;
  const role = elm.role;
  const id = elm.id;
  const testId = elm.dataset?.testId;
  const classes = elm.classList.toString();
  const parent = elm.parentElement;
  let parentSelector = null as null | string;
  let nthChild = null as null | number;
  const compressedTree = getCompressedElementTree(root, elm);

  if (parent) {
    parentSelector = getRawQueryString(parent);
    const foundIndex = findIndex(parent, elm);

    if (foundIndex > -1) {
      nthChild = foundIndex;
    }
  }

  return {
    tag,
    role,
    id,
    testId,
    classes,
    parent: parentSelector,
    nthChild,
    compressedTree
  };
}