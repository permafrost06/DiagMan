export const setCursor = (ctrl: HTMLInputElement, from: number, to: number) => {
    if (ctrl.setSelectionRange) {
        ctrl.focus();
        ctrl.setSelectionRange(from, to);
        // @ts-ignore
    } else if (ctrl.createTextRange) {
        // @ts-ignore
        const range = ctrl.createTextRange();
        range.collapse(true);
        range.moveEnd("character", to);
        range.moveStart("character", from);
        range.select();
    }
};
