
var org=[1,2,3,4,5];

// tag=[5,4,3,2,1];

//插入排序
//1.插入排序书
function insertSort(org) {
	
	for(var i=1;i<org.length;i++){
		var temp=org[i];
		var j=i-1;
		while(j>=0&&org[j]<temp){
			org[j+1]=org[j];
			j--;
		};
		org[j+1]=temp;
	}
	return org;
};

// console.log(insertSort(org))

//2.归并排序

function merge(left,right){
	var result=[];

	while(left.length&&right.length){

		if(left[0]>right[0]){
			result.push(left.shift());
		}else{
			result.push(right.shift());
		}
	}

	if(left.length){
		result.push(...left);
	}
	if(right.length){
		right.push(...right);
	}

	return result;
};

function mergeSort(org){
	if(org.length<2){
		return org
	}
	var len=org.length;
	var middle=Math.floor(len/2);
	var left=org.slice(0,middle);
	var right=org.slice(middle);

	return merge(mergeSort(left),mergeSort(right));
};

// console.log(mergeSort(org));

//3.冒泡排序
function bubbleSort(org){
	var len=org.length;
	for(var i=0;i<len;i++){

		for(var j=0;j<len-i-1;j++){

			if (arr[j] > arr[j+1]) {        //相邻元素两两对比
                var temp = arr[j+1];        //元素交换
                arr[j+1] = arr[j];
                arr[j] = temp;
            }
		}
	}

	return org;
}

//console.log(bubbleSort(org));


//4.选择排序

function selectSort(org){
	for(var i=0;i<org.length;i++){
		for(var j=i+1;j<org.length;j++){
			if(org[i]<org[j]){
				var temp=org[i];
				org[i]=org[j];
				org[j]=temp;
			}
		}
	}
	return org;
}

//console.log(selectSort(org));

//希尔排序



//快速排序

function quickSort(arr,left,right){

	if(left>=right)
		return;

	var tagert=arr[left];
	var i=left;
	var j=right;

	while(i<j){

		while(arr[j]<=tagert&&i<j){
			j--;
		}

		while(arr[i]>=tagert&&i<j){
			i++;
		}

		if(i<j){
			var temp=arr[j];
			arr[j]=arr[i];
			arr[i]=temp;
		}
	}

	arr[left]=arr[i];
	arr[i]=tagert;

	quickSort(arr,left,i-1);
	quickSort(arr,i+1,right);
}
