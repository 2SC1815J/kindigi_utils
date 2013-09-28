// ==UserScript==
// @name        kindigi_css_mod
// @description 国立国会図書館デジタル化資料／近代デジタルライブラリーのCSS修正
// @version     0.1
// @author      2SC1815J
// @date        2013-09-28
// @namespace   http://d.hatena.ne.jp/npn2sc1815j/
// @include     http://dl.ndl.go.jp/*
// @include     http://kindai.ndl.go.jp/*
// ==/UserScript==

// The following function is form https://gist.github.com/BrockA/2625891 .
// Thanks, Brock Adams!
/*--- waitForKeyElements():  A utility function, for Greasemonkey scripts,
    that detects and handles AJAXed content.

    Usage example:

        waitForKeyElements (
            "div.comments"
            , commentCallbackFunction
        );

        //--- Page-specific function to do what we want when the node is found.
        function commentCallbackFunction (jNode) {
            jNode.text ("This comment changed by waitForKeyElements().");
        }

    IMPORTANT: This function requires your script to have loaded jQuery.
*/
function waitForKeyElements (
    selectorTxt,    /* Required: The jQuery selector string that
                        specifies the desired element(s).
                    */
    actionFunction, /* Required: The code to run when elements are
                        found. It is passed a jNode to the matched
                        element.
                    */
    bWaitOnce,      /* Optional: If false, will continue to scan for
                        new elements even after the first match is
                        found.
                    */
    iframeSelector  /* Optional: If set, identifies the iframe to
                        search.
                    */
) {
    var targetNodes, btargetsFound;

    if (typeof iframeSelector == "undefined")
        targetNodes     = $(selectorTxt);
    else
        targetNodes     = $(iframeSelector).contents ()
                                           .find (selectorTxt);

    if (targetNodes  &&  targetNodes.length > 0) {
        btargetsFound   = true;
        /*--- Found target node(s).  Go through each and act if they
            are new.
        */
        targetNodes.each ( function () {
            var jThis        = $(this);
            var alreadyFound = jThis.data ('alreadyFound')  ||  false;

            if (!alreadyFound) {
                //--- Call the payload function.
                var cancelFound     = actionFunction (jThis);
                if (cancelFound)
                    btargetsFound   = false;
                else
                    jThis.data ('alreadyFound', true);
            }
        } );
    }
    else {
        btargetsFound   = false;
    }

    //--- Get the timer-control variable for this selector.
    var controlObj      = waitForKeyElements.controlObj  ||  {};
    var controlKey      = selectorTxt.replace (/[^\w]/g, "_");
    var timeControl     = controlObj [controlKey];

    //--- Now set or clear the timer as appropriate.
    if (btargetsFound  &&  bWaitOnce  &&  timeControl) {
        //--- The only condition where we need to clear the timer.
        clearInterval (timeControl);
        delete controlObj [controlKey]
    }
    else {
        //--- Set a timer, if needed.
        if ( ! timeControl) {
            timeControl = setInterval ( function () {
                    waitForKeyElements (    selectorTxt,
                                            actionFunction,
                                            bWaitOnce,
                                            iframeSelector
                                        );
                },
                300
            );
            controlObj [controlKey] = timeControl;
        }
    }
    waitForKeyElements.controlObj   = controlObj;
}
//------------------------------------------------------------------------

(function($) {
  // 2013年9月27日のレイアウト変更で使いにくくなった箇所を応急的に変更する。
  // 細かい辻褄合わせはしていない。対象の選択は手を抜いている。
  
  // 検索窓 → 赤色の枠は目に付きすぎるので変更。
  $('#search-textbox').css('cssText', 'border-color:transparent;');
  // 検索ボタン → 青色の枠は目に付きすぎるので変更。
  $('.mainbutton').css('cssText', 'height:23px; border-top-width:0px; border-color:transparent; background-image:url("/resources/images/button-bg.png");');
  
  // コンテンツ表示エリアの各種ボタンが大きくなりすぎて使いにくいので小さくする。
  // 概観図オン・表示領域設定・JPEG表示等の列のボタン下端が、画像の上端とちょうど
  // 接してしまい、両者がひとつながりに見えて混乱するので、ボタンを小さくする。
  // （ボタンアイコンが大きいままなのは仕様。余力のある方は直してください。）
  waitForKeyElements(
    '.minibutton, .mb-placeholder',
    minibuttonCallbackFunction
  );
  waitForKeyElements(
    '.imagecontrol',
    imagecontrolCallbackFunction
  );
  
  function minibuttonCallbackFunction(jNode) {
    jNode.css('cssText', 'height:20px; font-weight:normal; font-size:100%;');
  }
  function imagecontrolCallbackFunction(jNode) {
    jNode.css('cssText', 'padding-bottom:6px;');
  }
})(jQuery);
