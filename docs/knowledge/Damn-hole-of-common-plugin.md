# 常用插件包问题

## WebUploader

### 多种文件类型上传

```
extensions: 'gif,jpg,jpeg,bmp,png,pdf,doc,docx,txt,xls,xlsx,ppt,pptx,zip,mp3,mp4,text,csv',
                mimeTypes: 'image/*,text/*'
                    //word
                +',application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                    //excel
                +',application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    //ppt
                +',application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation'
                +',application/pdf'
                +',application/zip'
                +',application/csv'
```

### 上传文件写法

```
// html
            <div class="upload-operation">
              <div class="upload-btn manual-upload" id="picker">点击上传</div>
              <span class="form-send-desc">只能上传word、txt、excel、pdf、ppt文件，最多5个</span>
              <span class="form-send-desc" v-if="loading"><i class="el-icon-loading"></i>文件上传中...</span>
            </div>
            <div class="upload-success-list">
              <div class="upload-success-item" v-for="(file, index) in fileList" :key="index">
                <img class="upload-success-item-img fl" :src="require('../../../../../assets/' + fileImg[file.fileType])" v-if="fileImg[file.fileType]" alt=""/>
                <span class="upload-success-item-name" :title="file.fileName">{{file.fileName}}</span>
                <span class="upload-success-item-size">{{file.fileSize > 1048576 ? `${(file.fileSize / 1024 / 1024).toFixed(2)}M` : `${(file.fileSize / 1024).toFixed(2)}K`}}</span>
                <i class="el-icon-close fr upload-success-item-close" @click="deleteSelectFile(index, $event)"></i>
              </div>
            </div>
            
// js
deleteSelectFile(index) {
    this.fileList.splice(index, 1);
    this.manual.userManuals.splice(index, 1);
},
uploadFile() {
    this.$nextTick(function fun() {
        (function funName($, self) {
            $(() => {
            self.uploader = WebUploader.create({
            	accept: [{
                    extensions: 'pdf,doc,docx,txt,xls,xlsx,ppt,pptx',
                    mimeTypes: 'text/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf',
                }],
                thumb: {
                    width: 128,
                    height: 128,
                },
                swf: '../../../../../../static/webuploader/Uploader.swf',
                server: '/cloudfs/api/fs/upload',
                pick: {
                	id: '#picker',
                },
                fileNumLimit: 5,
                // fileSingleSizeLimit: 1 * 1024 * 1024    // 1 M
            });
            self.uploader.onFileQueued = (file) => {
                self.loading = true;
                self.addFile(file);
            };
            self.uploader.on('uploadSuccess', (file, ret) => {
                self.fileList.forEach((ele, idx) => {
                    console.log(ele, file);
                    if (ele.fileName === file.name) {
                    	self.manual.userManuals[idx].fileId = ret.fId;
                	}
            	});
                console.log(self.fileList);
                self.loading = false;
            });

            self.uploader.on('uploadError', (file) => {
                self.$message.error({
                	message: `${file.name}文件上传失败`,
                });
            });

            self.uploader.on('all', (type) => {
                switch (type) {
                	case 'uploadFinished':
                        console.log('所有上传完成');
                        console.log(self.manual);
                	break;
                    case 'filesQueued':
                    	self.uploader.upload();
                    break;
                	default:
            }
        });

        self.uploader.onError = (code, max, file) => {
            switch (code) {
                case 'F_EXCEED_SIZE':
                    self.$message.error({
                        message: `${file.name}大小超过1M`,
                    });
            	break;
                case 'Q_EXCEED_NUM_LIMIT':
                    self.$message.error({
                    	message: '文件不能超过5个',
                    });
                break;
                case 'F_DUPLICATE':
                    self.$message.error({
                    	message: '选择文件存在重复提交',
                    });
                break;
                case 'Q_TYPE_DENIED':
                    self.$message.error({
                    	message: '选择的文件格式不对',
                    });
                break;
                default:
                self.$message.error({
                	message: `error:${code}`,
                });
                break;
            	}
            };
        });
    }(jQuery, this));
});
},
    // 往uploader队列添加合法的图片信息
    addFile(file) {
      if (file.getStatus() === 'invalid') {
        this.showError(file.statusText);
      } else {
        const batch = {};
        batch.fileName = file.name;
        batch.fileSize = file.size;
        batch.fileType = file.ext;
        this.uploader.makeThumb(file, () => {
          this.fileList.push(batch);
          // if (error) {
          //   batch.error = '不能预览';
          //   batch.description = '';
          //   batch.file = file;
          //   this.fileList.push(batch);
          // } else {
          //   batch.src = ret;
          //   batch.description = '';
          //   batch.file = file;
          //   this.fileList.push(batch);
          // }
        });
        this.manual.userManuals.push(batch);
      }
    },
    // 添加队列信息中是否会有错误数据
    showError(code) {
      let text = '';
      switch (code) {
        case 'exceed_size':
          text = '文件大小超出';
          break;
        case 'interrupt':
          text = '上传暂停';
          break;
        default:
          text = '上传失败，请重试！';
          break;
      }
      this.$message.error({
        message: text,
      });
    },
    importManual() {
      appManage.importManual({
        params: {
          data: this.manual,
        },
      }).then((data) => {
        if (data.state === 0) {
          this.$message({
            message: '应用新增成功！',
            type: 'success',
          });
          this.$router.push({
            name: 'appManagement',
          });
        } else {
          this.$message({
            message: data.message,
            type: 'error',
          });
        }
      }).catch((err) => {
        this.$message.error(err);
      });
    },
```

