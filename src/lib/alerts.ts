import Swal from 'sweetalert2';

const toastBase = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2800,
    timerProgressBar: true,
});

export function alertSuccess(title: string): Promise<void> {
    return toastBase.fire({ icon: 'success', title }).then(() => undefined);
}

export function alertInfo(title: string): Promise<void> {
    return toastBase.fire({ icon: 'info', title }).then(() => undefined);
}

export function alertError(title: string, text?: string): Promise<void> {
    return Swal.fire({
        icon: 'error',
        title,
        text,
        confirmButtonText: 'Entendido',
    }).then(() => undefined);
}

export function alertWarning(title: string, text?: string): Promise<void> {
    return Swal.fire({
        icon: 'warning',
        title,
        text,
        confirmButtonText: 'Entendido',
    }).then(() => undefined);
}
