(function(root, factory){
	if(typeof define === 'function' && define.amd){
		define([], factory);
	}else{
		root.printer = factory(root);
	}
}(this, function(root){
	var printer = {
		"string" : "你好。", // 需要打印的文字  空格隔开拼音词组
		"dom": {},
		"inputDom": {},
		"speed" : 100,		//文字的速度
		"curType" : '_',		//光标字符
		"phrase": [],
		"pinYin": [],
		"item": [],
		"itemlen" : 10 ,  // 候选词最多为
		"endlabel": 0
	};

	printer.init = function(arg_options){
		for( var option in arg_options ){
			printer[option] = arg_options[option];
		}
		printer.dom = document.getElementById(printer.ID);
		printer.dom .innerHTML = "<span class='cursor blink'>"+ printer.curType +"</span>";
		printer.inputDom = document.getElementById(printer.inputDom);
		printer.show = document.getElementById(printer.showDom);
		printer.phrase = printer.string.split(' ');
		printer.endlabel = printer.phrase.length;
		printer.convert();
		return this;
	}

	printer.convert = function(){
		for(var str in printer.phrase){
			if( !printer.isPunctuation(printer.phrase[str]) ){
				printer.pinYin[str] = printer.ConvertPinyin(printer.phrase[str]);
			} else {
				printer.pinYin[str] = printer.phrase[str];
			}
		}
	}

	printer.isPunctuation = function(l1){
		var reg = new RegExp("[`~%!@#^=''?~！@#￥……&——‘”“'？*()（），,。.、；]");
		if(reg.test(l1)){
			return true;
		} else {
			return false;
		}
	}
	printer.isPinYin = function(l1){
		var reg = new RegExp("[~%!@#^=?~！@#￥……&——‘”“？*()（），,。.、；]");
		if(reg.test(l1)){
			return true;
		} else {
			return false;
		}
	}

	printer.ConvertPinyin = function(l1) {
	    var l2 = l1.length;
	    var I1 = "";
	    for (var i = 0; i < l2; i++) {
	        var val = l1.substr(i, 1);
	        var name = printer.arraySearchChinese(val);
	        if(i > 0){
	        	I1 = I1+"'"+name;
	        } else {
	        	I1 += name;
	        }
	        
	    }
	    I1 = I1.replace(/ /g, '-');
	    while (I1.indexOf('--') > 0) {
	        I1 = I1.replace('--', '-');
	    }
	    return I1;
	}
	printer.ConvertChinese = function(C1){
		var C2,C3=[];
		C2 = printer.isPunctuation(C1) ? C1.split('\'') : [C1];
		for(var i in C2){
			C3[i] = printer.arraySearchPinyin(C2[i]);
		}
		return C3;
	}

	printer.arraySearchChinese = function(l1) {
	    for (var name in PinYin) {
	        if (PinYin[name].indexOf(l1) != -1) {
	            return name; 
	        }
	    }
	    return false;
	}
	printer.arraySearchPinyin = function(C1) {
		for (var name in PinYin) {
	        if(name.indexOf(C1) == 0){
	        	// console.log(name+" in "+C1);
	        	return PinYin[name];
	        }
	    }
	    return false;
	}

	printer.print = function(callback){
		for (var label in printer.pinYin) {
			(function(label){
				var string = printer.pinYin[label];
				var time = (function(label){
					var number_label =  parseInt(label);
					if(number_label == 0){
						return 0;
					}
					var num = 0;
					for (var i = number_label-1; i >= 0; i--) {
						num = num + printer.pinYin[i].length;
					};
					return (num + number_label ) * printer.speed;
				}(label));
				setTimeout(function(){
					for(var i=0; i < string.length; i++) {
						(function(index){
							setTimeout(function(){
								str = string.charAt(index);
								if(str == '\''){
									str += string.charAt(index+1);
								}
								printer.dom.children[0].insertAdjacentHTML('beforebegin', str);
								// printer.dom.innerHTML += str;
								printer.updateItem(string.substring(0,index+1),label);
							}, printer.speed * (index));
						})(i);
						if(string.charAt(i) == '\''){
							i++;
						}
					}
					printer.updateString(label,callback);
				}, time);
			})(label);
		};
		return this;
	}

	function constitute(arg,label){
		var chr = printer.phrase[label];
		var length = arg.length;
		var num = printer.itemlen - length;
		var arg_re = [];
		if(length == 1){
			arg[0].replace(chr,"");
			arg_re = arg[0].split("");
			arg_re[0] = chr.substring(0,length);
			return arg_re.slice(0,num);
		} else {

			arg_re[0] = chr.substring(0,length);
			for (var i = 1; i < num; i++) {
				arg_re[i] = getCode(arg);
			};
			// console.log(arg_re +"   "+num);
			return arg_re;
		}
	}

	//  输入法核心算法  凑字
	function getCode(arg){
		var len = arg.length;
		var str = "";
		if(len == 1){
			var l = arg[0].length;
			var sss = arg[0].charAt(Math.random()*l);
			return sss;
		} else {
			var tmp = arg.shift();
			str = tmp.charAt(Math.random()*tmp.length);
		}
		str = str + getCode(arg);
		return str;
	}
	function offset(Node, p) {
	    if (!p) {
	        p = {};
	        p.top = Node.offsetHeight;
	        p.left = Node.offsetWidth;
	    }
	    if (Node == document.body) {//当该节点为body节点时，结束递归
	        return p;
	    }
	    p.top += Node.offsetTop;
	    p.left += Node.offsetLeft;
	    return offset(Node.parentNode, p);//向上累加offset里的值
	}

	printer.updateString = function(index){	
		printer.inputDom.style.display = "none";
		printer.dom.children[0].className = "cursor blink";
		if(index > 0){
			printer.dom.innerHTML = printer.dom.innerHTML.replace(printer.pinYin[index-1],printer.phrase[index-1]);
			printer.show.innerHTML = printer.dom.innerHTML.length - 36 + " 个字";
		}
	}

	printer.updateItem = function(string,index){
		printer.dom.children[0].className = "cursor";
		if(!string == "" && !printer.isPinYin(string)){
			var p = offset(printer.dom.children[0]);
			printer.inputDom.style.display = "block";
			printer.inputDom.style.top  = p.top  +"px";
			printer.inputDom.style.left  = p.left  +"px";	
			printer.inputDom.innerHTML = string;
			var arg_ch = printer.ConvertChinese(string);
			var arg_item = constitute(arg_ch,index);
			var dom = "";
			for(var item in arg_item){
				dom += "<div class='block'><span class='num'>"+ (parseInt(item)+1) +"</span><span class='centent'>"+ arg_item[item] +"</span></div>";
			}
			printer.inputDom.innerHTML = dom;
			printer.inputDom.children[0].className = "block frist";
		}
	}

	return printer;
}));
