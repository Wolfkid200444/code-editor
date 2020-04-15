import fs from './modules/utils/internalFs';
/**
 * @typedef {object} fileBrowserSettings
 * @property {string} showHiddenFiles
 * @property {string} sortByName
 */

/**
 * @typedef {object} searchAndFindSettings
 * @property {boolean} wrap
 * @property {boolean} caseSensitive
 * @property {boolean} regExp
 */

/**
 * @typedef {object} settingsValue
 * @property {fileBrowserSettings} fileBrowser
 * @property {number} maxFileSize
 * @property {string[]} filesNotAllowed
 * @property {searchAndFindSettings} search
 * @property {string} lang
 */

class Settings {
    constructor(lang) {
        lang = lang || "en-us";
        /**
         * @type {settingsValue}
         */
        this.defaultSettings = {
            autosave: 0,
            fileBrowser: {
                showHiddenFiles: 'off',
                sortByName: 'on'
            },
            maxFileSize: 5,
            filesNotAllowed: ['zip', 'apk', 'doc', 'docx', 'mp3', 'mp4', 'avi', 'flac', 'mov', 'rar', 'pdf', 'gif'],
            search: {
                caseSensitive: false,
                regExp: false,
                wholeWord: false,
                backwards: true
            },
            lang,
            fontSize: "12px",
            editorTheme: /free/.test(BuildInfo.packageName) ? "ace/theme/textmate" : "ace/theme/pastel_on_dark",
            appTheme: /free/.test(BuildInfo.packageName) ? "default" : "dark",
            textWrap: true,
            softTab: true,
            tabSize: 2,
            linenumbers: true,
            beautify: ['*'],
            linting: false,
            autoCorrect: true,
            previewMode: 'none',
            showSpaces: false,
            openFileListPos: 'header',
            quickTools: true,
            editorFont: "default"
        };
        this.settingsFile = DATA_STORAGE + 'settings.json';
        this.loaded = false;
        this.onload = null;
        this.onsave = null;
        let interval;
        const save = () => {
            interval = setInterval(() => {
                fs.writeFile(this.settingsFile, JSON.stringify(this.value), true, false)
                    .then(() => {
                        this.value = this.defaultSettings;
                        this.loaded = true;
                        if (interval) clearInterval(interval);
                        if (this.onload) this.onload();
                    })
                    .catch(() => {
                        save();
                    });
            }, 1000);
        };

        fs.readFile(this.settingsFile)
            .then((res) => {
                const decoder = new TextDecoder();
                const settings = JSON.parse(decoder.decode(res.data));
                if (!Array.isArray(settings.beautify)) savedSettings.beautify = ['*'];
                for (let setting in this.defaultSettings)
                    if (!(setting in settings)) settings[setting] = this.defaultSettings[setting];
                this.value = settings;
                this.loaded = true;
                if (this.onload) this.onload();
            }).catch(save);
    }
    update(showToast = true) {
        fs.writeFile(this.settingsFile, JSON.stringify(this.value), true, false)
            .then(() => {
                if (this.onsave) this.onsave();
                if (showToast)
                    plugins.toast.showShortBottom(strings['settings saved']);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    reset() {
        this.value = this.defaultSettings;
        this.update(false);
    }
}

export default Settings;