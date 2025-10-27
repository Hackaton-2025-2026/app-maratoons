export function generateAvatar(firstName: string): string {
    const initial = firstName.charAt(0).toUpperCase();
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
        '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B500', '#2ECC71'
    ];

    const colorIndex = initial.charCodeAt(0) % colors.length;
    const backgroundColor = colors[colorIndex];

    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');

    if (ctx) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, 120, 120);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initial, 60, 60);
    }

    return canvas.toDataURL();
}

export function getInitial(firstName: string): string {
    return firstName.charAt(0).toUpperCase();
}

export function getAvatarColor(firstName: string): string {
    const initial = firstName.charAt(0).toUpperCase();
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
        '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B500', '#2ECC71'
    ];

    const colorIndex = initial.charCodeAt(0) % colors.length;
    return colors[colorIndex];
}
