const rootStyles = window.getComputedStyle(document.documentElement);

if (
    rootStyles.getPropertyValue('--book-cover-width-large') != null &&
    rootStyles.getPropertyValue('--book-cover-width-large') != ''
) {
    ready();
} else {
    document.getElementById('main-css').addEventListener('load', ready);
}

function ready() {
    const coverWidth = parseFloat(
        rootStyles.getPropertyValue('--book-cover-width-large')
    );
    const ratio = parseFloat(
        rootStyles.getPropertyValue('--book-cover-aspect-ratio')
    );
    const coverHeight = coverWidth / ratio;
    FilePond.registerPlugin(
        FilePondPluginFileEncode,
        FilePondPluginImagePreview,
        FilePondPluginImageResize
    );

    FilePond.setOptions({
        stylePanelAspectRatio: 1 / ratio,
        imageResizeTargetWidth: coverWidth,
        imageResizeTargetHeight: coverHeight
    });

    FilePond.parse(document.body);
    console.log('Work');
}
