---
description: https://github.com/dznbk/tsundoku-dragon のissueをadd-featureコマンドに投げる
---

1. 引数のissue番号から対象となるissueのフルパスを割り出す
2. 割り出したフルパスを `/add-feature` コマンドに渡して実行する

例：

1. `/gh-issue 24` なら `https://github.com/dznbk/tsundoku-dragon/issues/24` のパスが割り出される
2. `/add-feature https://github.com/dznbk/tsundoku-dragon/issues/24` というように割り出したフルパスを渡してadd-featureを実行する
