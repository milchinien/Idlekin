export function flashTransition(canvas: HTMLCanvasElement) { canvas.animate([{ filter: 'brightness(2)' }, { filter: 'brightness(1)' }], { duration: 350, easing: 'ease-out' }); }
