export const seqSize = 80; // number bp in each row of the sequences table

export const bpPerItemUnscaled = 32; // at zoom 1; best if it's a power of 2

// For good performance, we want to render a fixed number of items at a time.
// For now, we specify this by considering the pixel width of each item;
// hopefully this means faster rendering when we resize the page because only
// new items will need to be rendered on the right size. We can reconsider later
// and change this parameter based on the width of the page, if wide pages are
// loading slowly. Another advantage of the fixed pixel width is that we can
// trivially add periodic visuals with this period.
export const itemWidthPx = 300;
