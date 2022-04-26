(function () {
    if (window.jQuery === undefined) {
        var script_tag = document.createElement('script');
        script_tag.setAttribute("type", "text/javascript");
        script_tag.setAttribute("src", "https://code.jquery.com/jquery-1.10.2.js");
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
    }
})();

var WidgetPlayblockPreview = function () {
    var _this = {};
    _this.item = {};
    _this.wcfUriBase = undefined;
    _this.localImages = {
    };
    _this.playblockPreviewTimer;
    _this.widgetDataTimeout = 15;//In minutes
    _this.widgetPreviewWaitTimeout = 10;//In seconds
    _this.videoTypes = /(\.wmv|\.mpg|\.mov|\.avi|\.mp4|\.mpeg|\.vob|\.m2ts|\.ism|\.flv|\.swf|\.mkv)$/i;
    _this.imageTypes = /(\.jpg|\.jpeg|\.png)$/i;
    _this.init = function () {
        if (_this.playblockPreviewTimer)
            _this.stopTimer();

        if (_this.options) {
            _this.options.isFirstTime = false;
        }
        else {
            _this.options = _this.getParams() || {};
            _this.options.isFirstTime = true;
        }

        var scriptObj = $('script[id*="widget_playblockpreview"]');
        if (isEmptyValue(scriptObj) || scriptObj.length === 0) {
            console.log('script object not found');
            return;
        }

        var widgetSelector = _this.item.containerID ? "#" + _this.item.containerID : "#" + _this.options.containerID;
        _this.widgetSelector = $(widgetSelector);
        var el = _this.widgetSelector.find("[id*=wt_playblockpreview]");
        if (isEmptyValue(el) || el.length === 0) {
            console.log('widget element not found');
            return;
        }

        if (_this.options.isRenderByURL === "true") {
            try {
                for (var i = 0, ln = scriptObj.length; i < ln; i++) {
                    if (scriptObj[i].dataset && scriptObj[i].dataset.sourceItem && scriptObj[i].dataset.containerID === el[0].id) {
                        var dto = JSON.parse(decodeURI(scriptObj[i].dataset.sourceItem));
                        if (isEmptyValue(dto.otherSettings) || Object.keys(dto.otherSettings).length === 0) {
                            console.log('otherSettings not found');
                            return;
                        }
                        var customSettings = scriptObj[i].dataset.customSettings ? JSON.parse(scriptObj[i].dataset.customSettings) : {};
                        dto.item = dto.item || {};
                        dto.options = dto.options || {};
                        _this.item = dto.item || {};
                        _this.item.settings = _this.item.settings || {};
                        _this.options.zIndex = dto.options.zIndex;
                        _this.options.scaleX = dto.options.scaleX || 1;
                        _this.options.scaleY = dto.options.scaleY || 1;
                        _this.options.width = dto.options.width;
                        _this.options.height = dto.options.height;
                        _this.otherSettings = dto.otherSettings;
                        _this.getWidgetDropped(_this.otherSettings, window.innerWidth, window.innerHeight);
                        _this.widgetSelector.css({
                            "top": _this.options.top ? _this.options.top + "px" : "",
                            "left": _this.options.left ? _this.options.left + "px" : "",
                            "z-index": _this.options.zIndex
                        });
                        if (!isEmptyValue(customSettings) && Object.keys(customSettings).length > 0) {
                            _this.item.settings.logoUrl = customSettings.ImageUrl;
                            _this.item.settings.datetimeOffset = customSettings.datetimeOffset;
                            _this.item.settings.timezoneID = customSettings.timezoneID;
                            _this.item.settings.customerID = customSettings.customerID;
                            _this.item.settings.authToken = customSettings.authToken;
                            _this.item.settings.playerName = customSettings.playerName;
                            _this.item.settings.playerIP = customSettings.playerIP;
                        }
                        break;
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
        }
        else if (!isEmptyValue(_this.jsonString)) {
            try {
                if ($('#drpctrl') && $('#drpctrl').length > 0) {
                    var jsondto = JSON.parse(_this.jsonString);
                    if (isEmptyValue(jsondto.otherSettings) || Object.keys(jsondto.otherSettings).length === 0) {
                        console.log('otherSettings not found');
                        return;
                    }
                    var clientWidth = $('#drpctrl')[0].clientWidth;
                    var clientHeight = $('#drpctrl')[0].clientHeight;
                    jsondto.options = jsondto.options || {};
                    _this.item = jsondto.item || {};
                    _this.item.settings = _this.item.settings || {};
                    _this.options.zIndex = jsondto.options.zIndex;
                    _this.options.scaleX = jsondto.options.scaleX || 1;
                    _this.options.scaleY = jsondto.options.scaleY || 1;
                    _this.options.width = jsondto.options.width;
                    _this.options.height = jsondto.options.height;
                    _this.otherSettings = jsondto.otherSettings || {};
                    _this.getWidgetDropped(_this.otherSettings, clientWidth, clientHeight);
                    for (var i = 0, ln1 = scriptObj.length; i < ln1; i++) {
                        if (el && el.length > 0 && scriptObj[i].dataset && scriptObj[i].dataset.sourceItem && scriptObj[i].dataset.containerID === el[0].id) {
                            var widget = JSON.parse(decodeURI(scriptObj[i].dataset.sourceItem)) || {};
                            _this.item.settings.customerID = widget.customerID;
                            _this.item.settings.authToken = widget.authToken;
                            break;
                        }
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
        }
        else {
            //For render in SD
            if ($('#drpctrl') && $('#drpctrl').length > 0) {
                _this.item.settings = _this.item.settings || {};
                for (var j = 0, ln1 = scriptObj.length; j < ln1; j++) {
                    if (el && el.length > 0 && scriptObj[j].dataset && scriptObj[j].dataset.sourceItem && scriptObj[j].dataset.containerID === el[0].id) {
                        var widget = JSON.parse(decodeURI(scriptObj[j].dataset.sourceItem)) || {};
                        _this.item.settings.customerID = widget.customerID;
                        _this.item.settings.authToken = widget.authToken;
                        _this.item.settings.channelID = widget.channelID;
                        _this.item.settings.playBlockID = widget.playBlockID;
                        _this.item.settings.WidgetMaxHeight = widget.WidgetMaxHeight;
                        _this.item.settings.WidgetMaxWidth = widget.WidgetMaxWidth;
                        break;
                    }
                }

                // Calculate scaling
                var containerWidth = $('#drpctrl')[0].clientWidth;
                var containerHeight = $('#drpctrl')[0].clientHeight;
                _this.setMaxHeightAndWidth(containerWidth, containerHeight);
                var transform = _this.widgetSelector.getTransform();
                if (transform && transform.scalex !== 1 && transform.scaley !== 1) {
                    //When transform ScaleX and ScaleY already exists (eg. When Saving settings of the widget)
                    _this.scaleX = transform.scalex;
                    _this.scaleY = transform.scaley;
                }
                else {
                    _this.scaleX = 1;
                    _this.scaleY = 1;
                    if (containerWidth <= _this.maxWidth) {
                        _this.scaleX = containerWidth / _this.maxWidth;
                        _this.scaleY = containerHeight / _this.maxHeight;
                    }
                    else if (containerWidth > _this.maxWidth) {
                        //If container is greater than max width then we need to scale widget to fit in container
                        //Because may be some widget have width greater then container. So, in this case widget will not fit in container
                        _this.scaleX = _this.maxWidth / containerWidth;
                        _this.scaleY = _this.maxHeight / containerHeight;
                    }
                }
            }
        }

        _this.injectStyleSheets();
    };

    _this.stopTimer = function () {
        if (_this.playblockPreviewTimer)
            clearInterval(_this.playblockPreviewTimer);
        if (_this.previewWidgetPlayerTimer)
            clearTimeout(_this.previewWidgetPlayerTimer);
        if (_this.getSelectedPlayblockTimer)
            clearTimeout(_this.getSelectedPlayblockTimer);

        _this.removeVideoTag();
    };

    _this.renderWidget = function (data) {
        var el = _this.widgetSelector.find("[id*=wt_playblockpreview]");
        _this.widgetSelector.css({
            "z-index": _this.options.zIndex,
        });
        el.html(data).addClass("playblockpreview");
        el.html(data);

        if (_this.options.isRenderByURL === "true") {
            _this.widgetSelector.css({
                '-webkit-transform': 'scale(' + _this.scaleX + ',' + _this.scaleY + ')',
                '-ms-transform': 'scale(' + _this.scaleX + ',' + _this.scaleY + ')',
                '-moz-transform': 'scale(' + _this.scaleX + ',' + _this.scaleY + ')',
                '-o-transform': 'scale(' + _this.scaleX + ',' + _this.scaleY + ')',
                'transform': 'scale(' + _this.scaleX + ',' + _this.scaleY + ')',
                '-webkit-transform-origin': '0% 0%',
                '-ms-transform-origin': '0% 0%',
                '-moz-transform-origin': '0% 0%',
                '-o-transform-origin': '0% 0%',
                'transform-origin': '0% 0%'
            });
        }
        else {
            _this.widgetSelector.setTransform('scalex', _this.scaleX).setTransform('scaley', _this.scaleY);
            unscaleWidgetSettings();
        }

        _this.preparePlayblockPreviewWidget();

        _this.showHideWireframeOverlay();
    };

    _this.injectStyleSheets = function () {
        if (_this.widgetUriBase) {
            if (isEmptyValue($('link[id*="widget_playblockpreview"]')) || $('link[id*="widget_playblockpreview"]').length === 0) {
                $('<link rel="stylesheet" type="text/css" />')
                    .attr({ 'href': _this.widgetUriBase + "style.css", 'id': "widget_playblockpreview" }).appendTo('head');
            }
            //Local images path
            _this.localImages.CameraBig = _this.widgetUriBase + "assets/camerabig.svg";
            _this.localImages.PlayblockCover = _this.widgetUriBase + "assets/ScreenDesigner_PlayblockCover.svg";
            _this.localImages.PlayIcon = _this.widgetUriBase + "assets/touch_play.svg";
        }

        _this.requestTemplate(function (responce) {
            if (responce) {
                _this.renderWidget(responce);
            }
        });
    };

    _this.setColorSetting = function () {

    };

    _this.preparePlayblockPreviewWidget = function () {
        var el = _this.widgetSelector.find("[id*=wt_playblockpreview]");
        el.css({
            "max-width": "100%",
            "max-height": "100%",
            "width": "100%",
            "height": "100%",
            "color": _this.options.color ? _this.options.color : "",
            "min-width": "288px",
            "min-height": "162px"
        });

        _this.widgetSelector.css({
            "width": "auto",
            "height": "auto",
            "min-width": "288px",
            "min-height": "162px"
        });
        el.selector = isEmptyValue(el.selector) ? ("#" + el[0].id) : el.selector;
        $(el.selector).parent().css({
            "width": _this.options.width ? _this.options.width + "px" : "1050px",
            "height": _this.options.height ? _this.options.height + "px" : "590.63px",
            "min-width": "288px",
            "min-height": "162px",
            "position": "static"
        });

        if (_this.item && _this.item.settings && _this.item.settings.IsPreview) {
            if (_this.item.settings.channelID > 0) {
                _this.removeVideoTag();
                if (_this.playblockPreviewTimer)
                    clearInterval(_this.playblockPreviewTimer);
                _this.playblockPreviewTimer = setInterval(function () {
                    _this.getMediaFilesByChannelID();
                }, _this.widgetDataTimeout * 60 * 1000);

                _this.getMediaFilesByChannelID();
            }
            else {
                _this.showHideWidget(false);
                _this.showHideLoader(false);
            }
        }
        else {
            _this.removeVideoTag();
            _this.getSelectedPlayblockFromLocalData(function (result) {
                if (!isEmptyValue(result)) {
                    _this.displayPlayblockThumb(result);
                }
                else {
                    _this.showHideWidget(false);
                }
            });
        }
    };

    _this.getSelectedPlayblockFromLocalData = function (callback) {
        function checkSelectedPlayblock() {
            _this.initilizeLocalWidgetData('selectedPlayblock');
            var localData = JSON.parse(LocalWidgetData) || [];
            if (localData && localData['selectedPlayblock']) {
                var dto = localData['selectedPlayblock'];
                if (!isEmptyValue(dto) && !isEmptyValue(dto.data) && dto.data.playblockID > 0 && dto.data.dataKey === _this.item.settings.channelID) {
                    if (_this.getSelectedPlayblockTimer) {
                        clearTimeout(_this.getSelectedPlayblockTimer);
                    }
                    callback(dto.data.playblockID);
                }
                else if (_this.getSelectedPlayblockTimerCount <= 10) {
                    _this.getSelectedPlayblockTimer = setTimeout(function () {
                        _this.getSelectedPlayblockTimerCount++;
                        checkSelectedPlayblock();
                    }, 1000);
                }
                else {
                    if (_this.getSelectedPlayblockTimer) {
                        clearTimeout(_this.getSelectedPlayblockTimer);
                    }
                    callback(null);
                }
            }
            else if (_this.getSelectedPlayblockTimerCount <= 10) {
                _this.getSelectedPlayblockTimer = setTimeout(function () {
                    _this.getSelectedPlayblockTimerCount++;
                    checkSelectedPlayblock();
                }, 1000);
            }
            else {
                if (_this.getSelectedPlayblockTimer)
                    clearTimeout(_this.getSelectedPlayblockTimer);
                callback(null);
            }
        }

        _this.getSelectedPlayblockTimerCount = 1;
        checkSelectedPlayblock();
    };

    _this.displayPlayblockThumb = function (playBlockID) {
        _this.removeVideoTag();
        if (playBlockID > 1) {
            _this.showHideWidget(true);
            _this.showHideLoader(false);
            var playblockPreviewGraphic = _this.wcfUriBase + "thumbnailer.ashx?ID=" + playBlockID + "&WHAT=PLAYBLOCKID&nodef=1&tn=800";
            var xhr = new XMLHttpRequest();
            xhr.onload = function () {
                _this.showHideLoader(true);
                var url = URL.createObjectURL(this.response);
                var img = new Image();
                img.crossOrigin = "anonymous";  // This enables CORS
                img.onload = function () {
                    _this.transparentImageEdge(img, playBlockID);
                    //Don't forget to free memory up when you're done (you can do this as soon as image is drawn to canvas)
                    URL.revokeObjectURL(url);
                };
                img.onerror = function () {
                    //Set default image 
                    var xhrForDefault = new XMLHttpRequest();
                    xhrForDefault.onload = function () {
                        var defaultUrl = URL.createObjectURL(this.response);
                        var defaultImg = new Image();
                        defaultImg.crossOrigin = "anonymous";  // This enables CORS
                        defaultImg.onload = function () {
                            _this.transparentImageEdge(defaultImg, playBlockID);
                            //Don't forget to free memory up when you're done (you can do this as soon as image is drawn to canvas)
                            URL.revokeObjectURL(defaultUrl);
                        };
                        defaultImg.src = defaultUrl;
                    };
                    xhrForDefault.open('GET', (_this.defaultThumb + "camerabig.svg"), true);
                    xhrForDefault.responseType = 'blob';
                    xhrForDefault.send();
                    //End set default image 
                };

                img.src = url;
            };

            xhr.open('GET', playblockPreviewGraphic, true);
            xhr.responseType = 'blob';
            xhr.send();
        }
        else {
            _this.showHideWidget(false);
        }
    };

    _this.transparentImageEdge = function (img, playBlockID) {
        if (_this.item && _this.item.settings && _this.item.settings.IsTransparencyEnable && !_this.item.settings.IsPreview) {
            try {
                var canvas = document.createElement('canvas');
                var imgHeight = !isEmptyValue(img.height) ? img.height : _this.options.height;
                var imgWidth = !isEmptyValue(img.width) ? img.width : _this.options.width;
                canvas.width = imgWidth;
                canvas.height = imgHeight;
                var context = canvas.getContext('2d');
                context.drawImage(img, 0, 0);
                var imageData = context.getImageData(0, 0, imgWidth, imgHeight);
                var maxAlphaValue = 255;
                var maxAlphaWidth = 128;
                var bottomAlpha = maxAlphaValue;
                var alphaIncreament = 2;
                for (var i = 0; i < imgHeight; i++) {
                    var rightAlpha = maxAlphaValue;
                    for (var j = 0; j < imgWidth; j++) {
                        var columnIdx = (i * ((imgWidth * 4)) + (j * 4) + 3);
                        if (j <= maxAlphaWidth) {
                            //Set left alpha.
                            imageData.data[columnIdx] = Math.min(imageData.data[columnIdx], j * alphaIncreament);
                        }
                        else if (j >= (imgWidth - maxAlphaWidth)) {
                            //Set right alpha.
                            imageData.data[columnIdx] = Math.min(imageData.data[columnIdx], rightAlpha);
                            rightAlpha = parseInt(rightAlpha) - alphaIncreament;
                        }
                        if (i <= maxAlphaWidth) {
                            //Set top alpha.
                            imageData.data[columnIdx] = Math.min(imageData.data[columnIdx], i * alphaIncreament);
                        }
                        else if (i >= (imgHeight - maxAlphaWidth)) {
                            //Set bottom alpha.
                            imageData.data[columnIdx] = Math.min(imageData.data[columnIdx], bottomAlpha);
                        }
                    }
                    //Calculate bottom alpha.
                    if (i >= (imgHeight - maxAlphaWidth)) {
                        bottomAlpha = parseInt(bottomAlpha) - alphaIncreament;
                    }
                }

                context.clearRect(0, 0, imgWidth, imgHeight);
                context.putImageData(imageData, 0, 0);
                var playblockViewString = "<div class='playblock-preview-faded'>";
                playblockViewString += "<div onclick='playMediaFile(" + playBlockID + ")' style='background-image:url(" + _this.localImages.PlayIcon + ")' class='playicon' ></div>";
                playblockViewString += "<img class='playblock-preview-thumb' src='" + canvas.toDataURL() + "'/>";
                playblockViewString += "</div>";
                _this.widgetSelector.find('.playblockpreview').html(playblockViewString);


            } catch (e) {
                console.log(e);
                var playblockViewString1 = "<div class='playblock-preview-faded'>";
                playblockViewString1 += "<div onclick='playMediaFile(" + playBlockID + ")' style='background-image:url(" + _this.localImages.PlayIcon + ")' class='playicon' ></div>";
                playblockViewString1 += "<img class='playblock-preview-thumb' src='" + img.src + "'/>";
                playblockViewString1 += "</div>";
                _this.widgetSelector.find('.playblockpreview').html(playblockViewString1);
            }
        }
        else {
            var playblockViewString2 = "<div class='playblock-preview-faded'>";
            playblockViewString2 += "<div onclick='playMediaFile(" + playBlockID + ")' style='background-image:url(" + _this.localImages.PlayIcon + ")' class='playicon' ></div>";
            playblockViewString2 += "<img class='playblock-preview-thumb' src='" + img.src + "'/>";
            playblockViewString2 += "</div>";
            _this.widgetSelector.find('.playblockpreview').html(playblockViewString2);
        }
    };

    _this.isVideoExistInTouchPlayblock = function (callback) {
        var isExist = false;
        for (var i = 0, ln = _this.mediaFiles.length; i < ln; i++) {
            //7= Touch playblock;
            if (_this.mediaFiles[i].Availability === 7 && _this.videoTypes.exec(_this.mediaFiles[i].FileName)) {
                isExist = true;
                break;
            }
        }

        callback(isExist);
    };

    _this.removeVideoTag = function () {
        try {
            if (_this.previewWidgetPlayerTimer)
                clearTimeout(_this.previewWidgetPlayerTimer);
            _this.widgetSelector.find("#widgetPreviewPlayer").empty();
            _this.widgetSelector.find(".playblockpreview").empty();
        }
        catch (ex) {
            console.log(ex);
        }
    };

    _this.filterMediaFile = function (playBlockID) {
        _this.filteredMediaFiles = [];
        if (_this.item && _this.item.settings && _this.item.settings.IsPreview) {
            if (_this.mediaFiles && _this.mediaFiles.length > 0) {
                if (playBlockID > 0) {
                    _this.showHideLoader(false);
                    _this.showHideWidget(true);
                    _this.isVideoExistInTouchPlayblock(function (result) {
                        _this.filteredMediaFiles = [];
                        var isVideosExistInTouchPlablock = false;
                        if (result) {
                            isVideosExistInTouchPlablock = true;
                            for (var i = 0, ln = _this.mediaFiles.length; i < ln; i++) {
                                if (!_this.videoTypes.exec(_this.mediaFiles[i].FileName) && _this.mediaFiles[i].PlayBlockId === playBlockID) {
                                    _this.filteredMediaFiles.push(_this.mediaFiles[i]);
                                }
                            }
                        }
                        else {
                            for (var j = 0, ln1 = _this.mediaFiles.length; j < ln1; j++) {
                                if (_this.mediaFiles[j].PlayBlockId === playBlockID) {
                                    _this.filteredMediaFiles.push(_this.mediaFiles[j]);
                                }
                            }
                        }

                        if (_this.currentPlayingPlayblock === playBlockID)
                            return;

                        _this.currentPlayingPlayblock = playBlockID;
                        //As discussed if touch playblock contain only video files then we will show playblock cover.
                        if (_this.filteredMediaFiles.length === 0 && isVideosExistInTouchPlablock) {
                            _this.displayPlayblockThumb(playBlockID);
                        }
                        else {
                            _this.generatePreview();
                        }
                    });
                }
                else {
                    _this.getSelectedPlayblockFromLocalData(function (result) {
                        if (!isEmptyValue(result)) {
                            _this.showHideLoader(false);
                            _this.showHideWidget(true);
                            _this.isVideoExistInTouchPlayblock(function (result1) {
                                var isVideosExistInTouchPlablock = false;
                                _this.filteredMediaFiles = [];
                                if (result1) {
                                    isVideosExistInTouchPlablock = true;
                                    for (var i = 0, ln = _this.mediaFiles.length; i < ln; i++) {
                                        if (!_this.videoTypes.exec(_this.mediaFiles[i].FileName) && _this.mediaFiles[i].PlayBlockId === result) {
                                            _this.filteredMediaFiles.push(_this.mediaFiles[i]);
                                        }
                                    }
                                }
                                else {
                                    for (var j = 0, ln2 = _this.mediaFiles.length; j < ln2; j++) {
                                        if (_this.mediaFiles[j].PlayBlockId === result) {
                                            _this.filteredMediaFiles.push(_this.mediaFiles[j]);
                                        }
                                    }
                                }

                                if (_this.currentPlayingPlayblock === result)
                                    return;

                                _this.currentPlayingPlayblock = result;
                                //As discussed if touch playblock contain only video files then we will show playblock cover.
                                if (_this.filteredMediaFiles.length === 0 && isVideosExistInTouchPlablock) {
                                    _this.displayPlayblockThumb(result);
                                }
                                else {
                                    _this.generatePreview();
                                }
                            });
                        }
                        else {
                            _this.showHideWidget(false);
                            _this.showHideLoader(false);
                        }
                    });
                }
            }
            else {
                _this.showHideWidget(false);
                _this.showHideLoader(false);
            }
        }
        else {
            if (playBlockID > 0) {
                _this.displayPlayblockThumb(playBlockID);
            }
            else {
                _this.getSelectedPlayblockFromLocalData(function (result) {
                    if (!isEmptyValue(result)) {
                        _this.displayPlayblockThumb(result);
                    }
                    else {
                        _this.showHideWidget(false);
                        _this.showHideLoader(false);
                    }
                });
            }
        }
    };

    _this.generatePreview = function () {
        _this.removeVideoTag();
        if (_this.filteredMediaFiles && _this.filteredMediaFiles.length > 0) {
            var isVideo = false;
            _this.currentPlayingIndex = isEmptyValue(_this.currentPlayingIndex) ? 0 : _this.currentPlayingIndex;
            _this.currentPlayingIndex = (_this.currentPlayingIndex >= _this.filteredMediaFiles.length) ? 0 : _this.currentPlayingIndex;
            var currentFile = _this.filteredMediaFiles[_this.currentPlayingIndex];
            if (_this.filteredMediaFiles.length > 1) {
                _this.currentPlayingIndex++;
            }
            else {
                _this.currentPlayingIndex = 0;
            }
            var currentChannelID = _this.item.settings.channelID;
            if (currentFile && !isEmptyValue(currentFile.FileName) && currentFile.MediaID > 0) {
                var mediaFileURL = _this.wcfUriBase + "downloadhandler.ashx?CONTEXT=dbeltvnoreltv2007&ID=" + currentFile.MediaID;
                getLocalPlayerMediaFileURL(currentFile.FileName, function (result) {
                    if (!isEmptyValue(result)) {
                        mediaFileURL = result;
                    }
                    var playblockViewString = "<div class='playblock-preview-faded'>";
                    playblockViewString += "<span onclick='playMediaFile(" + currentFile.PlayBlockId + ")' style='background-image:url(" + _this.localImages.PlayIcon + ")' class='playicon'></span >";
                    if (_this.imageTypes.exec(currentFile.FileName)) {
                        playblockViewString += "<img class='playblock-preview-thumb' src='" + mediaFileURL + "'/>";
                        currentFile.Duration = parseFloat(currentFile.Duration ? currentFile.Duration : 10);
                        if (_this.filteredMediaFiles.length > 1) {
                            _this.previewWidgetPlayerTimer = setTimeout(function () {
                                _this.generatePreview();
                            }, currentFile.Duration * 1000);
                        }

                    } else if (_this.videoTypes.exec(currentFile.FileName)) {
                        isVideo = true;
                        if (_this.filteredMediaFiles.length > 1) {
                            playblockViewString += "<video muted id='widgetPreviewPlayer'";
                            playblockViewString += "onended='playNextMediaFile(" + currentChannelID + ")'";
                            playblockViewString += "onplay='setNextMediaFileTimer(" + currentChannelID + ", " + currentFile.Duration + ")'";
                            playblockViewString += "onerror='playNextMediaFile(" + currentChannelID + ")'";
                            playblockViewString += "autoplay style='height:100%;width:100%;'>";
                            playblockViewString += "<source src= '" + mediaFileURL + "'/>";
                            playblockViewString += "</video>";
                        }
                        else {
                            playblockViewString += "<video muted id='widgetPreviewPlayer' loop='loop' autoplay style='height:100%;width:100%;'>";
                            playblockViewString += "<source src= '" + mediaFileURL + "'/>";
                            playblockViewString += "</video>";
                        }

                    }
                    playblockViewString += "</div>";
                    _this.widgetSelector.find('.playblockpreview').html(playblockViewString);
                    if (isVideo) {
                        var video = document.getElementById("widgetPreviewPlayer");
                        if (!isEmptyValue(video) && video.hasAttribute("controls")) {
                            //Hide controls
                            video.removeAttribute("controls");
                        }
                    }
                });
            }
            else {
                _this.showHideWidget(false);
            }
        }
        else {
            _this.showHideWidget(false);
            _this.showHideLoader(false);
        }
    };

    _this.getMediaFilesByChannelID = function (playblockID) {
        _this.mediaFiles = [];
        _this.showHideLoader(true);
        _this.mediaFiles = _this.getLocalData('mediaFiles', _this.item.settings.channelID) || [];
        if (!isEmptyValue(_this.mediaFiles) && _this.mediaFiles.length > 0) {
            _this.currentPlayingIndex = 0;
            _this.filterMediaFile(playblockID);
            return;
        }

        $.ajax({
            type: "POST",
            url: _this.wcfUriBase + "iSignage.svc/media_mediafilesbychannelidget?nc=" + Math.random(),
            data: JSON.stringify({
                "authToken": _this.item.settings.authToken, channelId: _this.item.settings.channelID, includeExpired: 0, includeFuture: 0
            }),
            contentType: "application/json;",
            dataType: "json",
            success: function (data, status) {
                _this.mediaFiles = [];
                _this.showHideLoader(false);
                if (data && data.Media_MediaFilesByChannelIdGetResult && data.Media_MediaFilesByChannelIdGetResult.length > 0) {
                    for (var i = 0, ln = data.Media_MediaFilesByChannelIdGetResult.length; i < ln; i++) {
                        if (data.Media_MediaFilesByChannelIdGetResult[i].MediaType && data.Media_MediaFilesByChannelIdGetResult[i].MediaType.toLowerCase() == "media file") {
                            _this.mediaFiles.push(data.Media_MediaFilesByChannelIdGetResult[i]);
                        }
                    }
                }
                _this.currentPlayingIndex = 0;
                _this.filterMediaFile(playblockID);
                _this.setLocalData("mediaFiles", _this.mediaFiles, _this.item.settings.channelID);
            },
            error: function (xhr) {
                _this.showHideLoader(false);
                _this.mediaFiles = _this.getRawLocalData('mediaFiles', _this.item.settings.channelID);
                if (!isEmptyValue(_this.mediaFiles) && _this.mediaFiles.length > 0) {
                    _this.currentPlayingIndex = 0;
                    _this.filterMediaFile(playblockID);
                }
                else {
                    console.log('Could not get Channel MediaFiles, old data does not exist. Will show msg for now. ' + _this.widgetSelector.selector
                        + '. ERROR: ');
                    _this.showHideWidget(false);
                }
            }
        });
    };

    _this.showHideWidget = function (isVisible) {
        if (isVisible) {
            _this.widgetSelector.show();
        }
        else {
            _this.removeVideoTag();
            if (_this.options.isRenderByURL === "true") {
                _this.widgetSelector.hide();
            }
            else {
                _this.widgetSelector.show();
                _this.widgetSelector.find('.playblockpreview').html("<img src='" + _this.localImages.PlayblockCover + "' style='padding:0 5%; width:100%; height:100%;' />");
            }
        }
    };

    _this.showHideLoader = function (isHide) {
        if (isHide) {
            _this.widgetSelector.find('.playblockpreview').find('.loader').css({ "display": "none" });
        }
        else {
            _this.widgetSelector.find('.playblockpreview').find('.loader').css({ "display": "block" });
        }
    };

    _this.requestTemplate = function (callback) {

        var wtTemplateString = "<div class='playblockpreview'>";
        wtTemplateString += "<div class='loader'>Loading...</div>";
        wtTemplateString += "</div>";

        callback(wtTemplateString);
    };

    _this.setMaxHeightAndWidth = function (containerWidth, containerHeight) {
        //As per new logic max height and width will be channel resolution to adjust widget scale 
        //Also you pass max height and width if you want to render widget elsewhere
        if (!isEmptyValue(_this.item) && !isEmptyValue(_this.item.settings) &&
            _this.item.settings.WidgetMaxHeight > 0 && _this.item.settings.WidgetMaxWidth > 0) {
            if (containerHeight > containerWidth) { // In case of potrait screen
                _this.maxWidth = _this.item.settings.WidgetMaxHeight;
                _this.maxHeight = _this.item.settings.WidgetMaxWidth;
            }
            else {
                _this.maxWidth = _this.item.settings.WidgetMaxWidth;
                _this.maxHeight = _this.item.settings.WidgetMaxHeight;
            }
        }
        else {
            if (containerHeight > containerWidth) { // In case of potrait screen
                _this.maxWidth = 1080;
                _this.maxHeight = 1920;
            }
            else {
                _this.maxWidth = 1920;
                _this.maxHeight = 1080;
            }
        }
    };

    _this.getWidgetDropped = function (dto, containerWidth, containerHeight) {
        _this.setMaxHeightAndWidth(containerWidth, containerHeight);
        var hundredHundred = 10000;
        _this.contentType = dto.WidgetType;
        _this.content = dto.WidgetTypeID;
        _this.control = {
        };
        _this.control.containerID = dto.ID;
        _this.control.control_type = dto.WidgetTypeID;
        _this.control.resizable = dto.IsResizable;
        _this.control.isSettingEnable = dto.IsSettingEnable;
        var divPos = {
            left: Math.round(dto.X * containerWidth / hundredHundred),
            top: Math.round(dto.Y * containerHeight / hundredHundred)
        };
        _this.position = divPos;
        _this.position.locatePosition = dto.LocatePosition;
        _this.offSet = divPos;

        _this.options = _this.options || {};
        _this.options.containerID = dto.ID;
        _this.options.templatetotake = dto.TemplateToTake;
        _this.options.left = Math.round(dto.X * containerWidth / hundredHundred);
        _this.options.top = Math.round(dto.Y * containerHeight / hundredHundred);

        //Set scaling:
        _this.scaleX = (containerWidth / _this.maxWidth) * _this.options.scaleX;
        _this.scaleY = (containerHeight / _this.maxHeight) * _this.options.scaleY;
    };

    _this.initilizeLocalWidgetData = function (dataFor) {
        if (typeof LocalWidgetData === 'undefined' || isEmptyValue(LocalWidgetData)) {
            LocalWidgetData = JSON.stringify({
                dataFor: { lastUpdatedOn: undefined, data: {} }
            });
        }
    };

    _this.getRawLocalData = function (dataFor, dataKey) {
        _this.initilizeLocalWidgetData(dataFor);
        var localData = JSON.parse(LocalWidgetData) || [];
        if (isEmptyValue(localData[dataFor])) {
            localData[dataFor] = { lastUpdatedOn: undefined, data: {} };
            return undefined;
        }
        else {
            var dto = localData[dataFor];
            if (!isEmptyValue(dto) && !isEmptyValue(dto.data) && Object.keys(dto.data).length > 0 && dto.data.dataKey === dataKey) {
                return dto.data.dataDetails;
            }
            else {
                return undefined;
            }
        }
    };

    _this.getLocalData = function (dataFor, dataKey) {
        _this.initilizeLocalWidgetData(dataFor);
        var localData = JSON.parse(LocalWidgetData) || [];
        if (isEmptyValue(localData[dataFor])) {
            localData[dataFor] = { lastUpdatedOn: undefined, data: {} };
            return undefined;
        }
        else {
            var dto = localData[dataFor];
            if (!isEmptyValue(dto) && !isEmptyValue(dto.data) && Object.keys(dto.data).length > 0 && dto.data.dataKey === dataKey) {
                if (dto.data.lastUpdatedOn && (new Date((new Date(dto.data.lastUpdatedOn)).getTime() + _this.widgetDataTimeout * 60 * 1000)) > getDateTime())
                    return dto.data.dataDetails;
                else {
                    return undefined;
                }
            }
            else {
                return undefined;
            }
        }
    };

    _this.setLocalData = function (dataFor, data, dataKey) {
        _this.initilizeLocalWidgetData(dataFor);
        var localData = JSON.parse(LocalWidgetData) || [];
        if (isEmptyValue(localData[dataFor]))
            localData[dataFor] = { lastUpdatedOn: undefined, data: {} };

        localData[dataFor].data = {
            dataDetails: data,
            lastUpdatedOn: getDateTime(),
            dataKey: dataKey
        };

        LocalWidgetData = JSON.stringify(localData);
    };

    _this.getBasePath = function () {
        if (_this.scriptPath) {
            _this.widgetUriBase = _this.scriptPath.substring(0, _this.scriptPath.lastIndexOf('/') + 1);
        }
    };

    _this.getParams = function () {
        var path = "";
        var elmID = "";
        var indx = 0;
        while (document.getElementsByClassName('widget_playblockpreview')[indx]) {
            path = document.getElementsByClassName('widget_playblockpreview')[indx].src;
            elmID = getParameterByName(path, 'containerID');

            if ($.WidgetPlayblockPreview[elmID].scriptPath === path) {
                indx = indx + 1;
                continue;
            }
            else {
                break;
            }
        }

        _this.scriptPath = elmID ? path : "";
        var queryString = _this.scriptPath.replace(/^[^\?]+\??/, '');
        _this.getBasePath();
        return _this.parseQuery(queryString);
    };

    _this.parseQuery = function (query) {
        var Params = new Object();
        if (!query) return Params;
        var Pairs = query.split(/[;&]/);
        for (var i = 0; i < Pairs.length; i++) {
            var KeyVal = Pairs[i].split('=');
            if (!KeyVal || KeyVal.length !== 2) continue;
            var key = unescape(KeyVal[0]);
            var val = unescape(KeyVal[1]);
            val = val.replace(/\+/g, ' ');
            Params[key] = val;
        }
        return Params;
    };

    _this.Lpad = function (str, padStr, length) {
        str = new String(str);
        while (str.length < length)
            str = padStr + str;
        return str;
    };

    //This will call from screenctrl
    _this.showHideWireframeOverlay = function () {
        //Don't need to show overlay if isRenderByURL is true
        if (_this.options.isRenderByURL === "true")
            return;

        try {
            if (typeof gAppConfig !== 'undefined') {
                if (gAppConfig.isWiredFrameEnable) {
                    if (!_this.widgetSelector.find('.widgetWireframeOverlay') || _this.widgetSelector.find('.widgetWireframeOverlay').length === 0) {
                        _this.widgetSelector.find('.widgetWireframeContainer').append("<div class='widgetWireframeOverlay widgetOverlayborder' style='text-align: center; width: 100%;height:100%;'><img src='" + (_this.widgetUriBase + "assets/ScreenDesigner_PlayblockCover.svg") + "' style='width: 30%;height:80%; position:relative; top:10%'/></div>");
                    }
                    _this.widgetSelector.addClass("ui-resizable-disabled");
                }
                else {
                    _this.widgetSelector.removeClass("ui-resizable-disabled");
                    _this.widgetSelector.find('.widgetWireframeContainer').find('.widgetWireframeOverlay').remove();
                }
            }
        }
        catch (ex) {
            console.log(ex);
        }
    };

    return _this;
};

function isEmpty(value) {
    if (value === "" || value === undefined) { return true; } else { return false; }
}

function isEmptyValue(value) {
    if (value === "" || value === 0 || value === undefined || value === null) { return true; } else { return false; }
}

function getDateTime() {
    if (typeof Player !== 'undefined' && Player.init && typeof Utility !== 'undefined' && typeof Utility.getDate === 'function') {
        return Utility.getDate();
    }
    else {
        return new Date();
    }
}

function playMediaFile(playblockID) {

    if (typeof window !== 'undefined' && typeof window.javascript_android_interface !== 'undefined' && typeof window.javascript_android_interface.onTouchPlayerMenu === 'function') {
        window.javascript_android_interface.onTouchPlayerMenu(playblockID);
    }
    else if (typeof Player !== 'undefined' && Player.init && typeof Player.onTouchPlayerMenu === 'function') {
        Player.onTouchPlayerMenu(playblockID);
    }
    else {
        return false;
    }
}

function getLocalPlayerMediaFileURL(fileName, callback) {
    try {

        if (typeof window !== 'undefined' && typeof window.javascript_android_interface !== 'undefined' && typeof window.javascript_android_interface.getLocalMediaFileURL === 'function') {            
            callback(window.javascript_android_interface.getLocalMediaFileURL(fileName));
        }
        else if (typeof Player !== 'undefined' && Player.init && typeof Utility !== 'undefined' && typeof Utility.getLocalMediaFileURL === 'function') {
            callback(Utility.getLocalMediaFileURL(fileName));
        }
        else {
            callback(null);
        }
    }
    catch (ex) {
        callback(null);
    }
}

function playNextMediaFile(channelID) {
    if ($ && !isEmpty($['WidgetPlayblockPreview']) && Object.keys($['WidgetPlayblockPreview']).length > 0) {
        for (var i = 0, ln = Object.keys($['WidgetPlayblockPreview']).length; i < ln; i++) {
            var val = Object.keys($['WidgetPlayblockPreview'])[i];
            if (!isEmpty(val) && !isEmpty($.WidgetPlayblockPreview) && !isEmpty($.WidgetPlayblockPreview[val]) && $.WidgetPlayblockPreview[val].item && $.WidgetPlayblockPreview[val].item.settings && $.WidgetPlayblockPreview[val].item.settings.channelID == channelID) {
                if ($.WidgetPlayblockPreview[val].previewWidgetPlayerTimer) {
                    clearTimeout($.WidgetPlayblockPreview[val].previewWidgetPlayerTimer);
                }
                if (typeof $.WidgetPlayblockPreview[val].generatePreview === "function") {
                    $.WidgetPlayblockPreview[val].generatePreview();
                }
                break;
            }
        }
    }
}

function setNextMediaFileTimer(channelID, duration) {
    if ($ && !isEmpty($['WidgetPlayblockPreview']) && Object.keys($['WidgetPlayblockPreview']).length > 0) {
        for (var i = 0, ln = Object.keys($['WidgetPlayblockPreview']).length; i < ln; i++) {
            var val = Object.keys($['WidgetPlayblockPreview'])[i];
            if (!isEmpty(val) && !isEmpty($.WidgetPlayblockPreview) && !isEmpty($.WidgetPlayblockPreview[val]) && $.WidgetPlayblockPreview[val].item && $.WidgetPlayblockPreview[val].item.settings && $.WidgetPlayblockPreview[val].item.settings.channelID == channelID) {
                $.WidgetPlayblockPreview[val].previewWidgetPlayerTimer = setTimeout(function () {
                    if (!isEmpty(val) && !isEmpty($.WidgetPlayblockPreview) && !isEmpty($.WidgetPlayblockPreview[val]) && (typeof $.WidgetPlayblockPreview[val].generatePreview === "function")) {
                        $.WidgetPlayblockPreview[val].generatePreview();
                    }
                }, parseFloat(duration) * 1000);
                break;
            }
        }
    }
}

//For Web app dependency on spsettings
function setWcfUrls(instance, url, callback) {
    var a = document.createElement('a');
    a.href = url;
    if (typeof WCF_URI_BASE !== 'undefined' && !isEmptyValue(WCF_URI_BASE)) {
        instance.wcfUriBase = WCF_URI_BASE;
    } else {
        instance.wcfUriBase = a.protocol + '//' + a.hostname + (a.port ? ':' + a.port : '') + '/wcf/';
    }
    callback(instance);
}

function getParameterByName(url, name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(url);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

//Please always keep this function at bottom.
(function () {
	console.log("callee called");
    if (typeof $ !== 'undefined' && document.getElementsByClassName('widget_playblockpreview') && document.getElementsByClassName('widget_playblockpreview').length > 0) {

        var src = getParameterByName(document.getElementsByClassName('widget_playblockpreview')[0].src, 'containerID');
        var indx = 0;
        while ($.WidgetPlayblockPreview && $.WidgetPlayblockPreview[src]) {
            indx = indx + 1;
            if (document.getElementsByClassName('widget_playblockpreview')[indx]) {
                src = getParameterByName(document.getElementsByClassName('widget_playblockpreview')[indx].src, 'containerID');
            }
            else {
                src = undefined;
            }
        }
        if (src) {
            $.WidgetPlayblockPreview = $.WidgetPlayblockPreview || [];
            var newWidget = new WidgetPlayblockPreview();
            setWcfUrls(newWidget, document.getElementsByClassName('widget_playblockpreview')[0].src, function (result) {
                $.WidgetPlayblockPreview[src] = result;
                $.WidgetPlayblockPreview[src].init();
            });
            var ctrlElement = $(".main-content-view");
            if (ctrlElement && ctrlElement.length > 0) {
                try {
                    var scope = angular.element($(".main-content-view")).scope();
                    if (scope) {
                        scope.applyWidgetSettings(src);
                    }
                }
                catch (ex) {
                    console.log(ex);
                }
            }
        }
		else {
				console.log("Else callee called");
				  setTimeout(arguments.callee, 100);
		}
    } else {
        setTimeout(arguments.callee, 100);
    }
})();



