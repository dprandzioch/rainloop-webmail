import ko from 'ko';

import { Notification } from 'Common/Enums';
import { UNUSED_OPTION_VALUE } from 'Common/Consts';
import { trim, defautOptionsAfterRender, folderListOptionsBuilder } from 'Common/Utils';

import { removeFolderFromCacheList } from 'Common/Cache';

import FolderStore from 'Stores/User/Folder';

import Promises from 'Promises/User/Ajax';

import { getApp } from 'Helper/Apps/User';

import { popup, command } from 'Knoin/Knoin';
import { AbstractViewNext } from 'Knoin/AbstractViewNext';

@popup({
	name: 'View/Popup/FolderMove',
	templateID: 'PopupsFolderMove'
})
class FolderMoveView extends AbstractViewNext {
	constructor() {
		super();

		this.originalFolder = ko.observable(null);
		this.selectedParentValue = ko.observable(UNUSED_OPTION_VALUE);
		this.parentFolderSelectList = ko.computed(() => {
			const top = [],
				list = FolderStore.folderList(),
				fRenameCallback = (oItem) =>
					oItem ? (oItem.isSystemFolder() ? oItem.name() + ' ' + oItem.manageFolderSystemName() : oItem.name()) : '';

			top.push(['', '']);

			let fDisableCallback = null;
			if ('' !== FolderStore.namespace) {
				fDisableCallback = (item) => FolderStore.namespace !== item.fullNameRaw.substr(0, FolderStore.namespace.length);
			}

			return folderListOptionsBuilder([], list, [], top, null, fDisableCallback, null, fRenameCallback);
		});

		console.log(this.parentFolderSelectList());

		this.defautOptionsAfterRender = defautOptionsAfterRender;
	}

	@command()
	moveFolderCommand() {
		let sNewParentFolder = this.selectedParentValue();
		const oOriginalFolder = this.originalFolder();

		if ('' !== sNewParentFolder) {
			sNewParentFolder = sNewParentFolder + oOriginalFolder.delimiter;
		}

		sNewParentFolder = sNewParentFolder + oOriginalFolder.name();

		getApp().foldersPromisesActionHelper(
			Promises.folderMove(oOriginalFolder.fullNameRaw, sNewParentFolder, FolderStore.foldersCreating),
			Notification.CantMoveFolder
		);

		removeFolderFromCacheList(oOriginalFolder.fullNameRaw);
		this.cancelCommand();
	}

	simpleFolderNameValidation(sName) {
		return /^[^\\/]+$/g.test(trim(sName));
	}

	clearPopup() {
		this.selectedParentValue('');
	}

	/**
	 * @param {object} oFolder
	 */
	onShow(oFolder) {
		this.originalFolder(oFolder);
		this.clearPopup();
	}
}

export { FolderMoveView, FolderMoveView as default };
