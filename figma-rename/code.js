// Sprout Batch Renamer
// Applies a list of {id, to} renames across the current file in a single undoable action.
// Usage: paste your rename-map.json into the UI textarea (or keep default), click Preview, then Apply.

figma.showUI(__html__, { width: 480, height: 620 });

// -- Helpers --------------------------------------------------------------

async function loadAllPages() {
  // dynamic-page mode requires explicit page loading before ID lookups work globally.
  try {
    await figma.loadAllPagesAsync();
  } catch (e) {
    // Fallback for older API versions
  }
}

async function previewRenames(entries) {
  await loadAllPages();
  const results = { willRename: [], missing: [], skipped: [] };
  for (const entry of entries) {
    const node = await figma.getNodeByIdAsync(entry.id).catch(() => null);
    if (!node) {
      results.missing.push(entry);
      continue;
    }
    if (node.name === entry.to) {
      results.skipped.push(Object.assign({}, entry, { currentName: node.name }));
      continue;
    }
    results.willRename.push(Object.assign({}, entry, { currentName: node.name }));
  }
  return results;
}

async function applyRenames(entries) {
  await loadAllPages();
  let renamed = 0;
  let missing = 0;
  let unchanged = 0;
  const errors = [];
  for (const entry of entries) {
    try {
      const node = await figma.getNodeByIdAsync(entry.id);
      if (!node) { missing++; continue; }
      if (node.name === entry.to) { unchanged++; continue; }
      node.name = entry.to;
      renamed++;
    } catch (e) {
      errors.push({ id: entry.id, error: String(e) });
    }
  }
  return { renamed, missing, unchanged, errors };
}

// -- Message bus ----------------------------------------------------------

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'preview') {
    try {
      const entries = JSON.parse(msg.json);
      if (!Array.isArray(entries)) throw new Error('Expected an array');
      const res = await previewRenames(entries);
      figma.ui.postMessage({ type: 'preview-result', result: res, total: entries.length });
    } catch (e) {
      figma.ui.postMessage({ type: 'error', error: String(e) });
    }
    return;
  }

  if (msg.type === 'apply') {
    try {
      const entries = JSON.parse(msg.json);
      if (!Array.isArray(entries)) throw new Error('Expected an array');
      const res = await applyRenames(entries);
      figma.ui.postMessage({ type: 'apply-result', result: res, total: entries.length });
      figma.notify(`Renamed ${res.renamed} layers (${res.missing} missing, ${res.unchanged} unchanged).`);
    } catch (e) {
      figma.ui.postMessage({ type: 'error', error: String(e) });
    }
    return;
  }

  if (msg.type === 'close') {
    figma.closePlugin();
  }
};
