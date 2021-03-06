import React, {
  useState, useEffect
}  from 'react';
import { PlusSquareTwoTone, UploadOutlined } from '@ant-design/icons';
import request from '@/utils/request';
import ImgCrop from 'antd-img-crop';
import { pictureSize } 
  from '@/utils/Token';
import {
  Form, Icon,
  Button, Select, 
  InputNumber, Upload, Modal, Divider, Table, Space, Tabs,  Col
   
} from 'antd';
import { connect, Link } from 'umi';
import { get } from 'lodash';

const { Option, OptGroup } = Select;
const { Column } = Table;
const { TabPane } = Tabs;

const layout = {
  labelCol: {
    span: 3,
  },
  wrapperCol: {
    span: 16,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 12,
    span: 16,
  },
};

const RollingPictures = (props) => {
  const QINIU_SERVER = 'http://upload-z2.qiniup.com';
  const BASE_QINIU_URL = 'http://qiniu.fmg.net.cn/';
  const [qiniuToken, setQiniuToken] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [showAdj, setShowAdj] = useState(false);
  const [oriOrder, setOriOrder] = useState(0);
  const [oriId, setOriId] = useState(0);
  const [oriPicture, setOriPicture] = useState('');
  const [rid, setRid] = useState(0);
  const [fileList, setFileList] = useState(([]));
  const [rollingInfos, setRollingInfos] = useState({});
  const handlePreview = (file) => {
    setPreviewImage(file.url || file.thumbUrl);
    setPreviewVisible(true);
  };
  const handleChange = ({ file  }) => {
    const {
      uid, name, type, thumbUrl, status, response = {},
    } = file;
    const fileItem = {
      uid,
      name,
      type,
      thumbUrl,
      status,
      response,
      url: BASE_QINIU_URL + (response.key || ''),
    };
    setPreviewImage(fileItem.url);
    setFileList([fileItem]);
  };
  const handleChangefile = ({ file  }) => {
    const {
      uid, name, type, thumbUrl, status, response = {},
    } = file;
    const fileItem = {
      uid,
      name,
      type,
      thumbUrl,
      status,
      response,
      url: BASE_QINIU_URL + (response.key || ''),
    };
    setOriPicture(fileItem.response.key);
  };
  const getQiNiuToken = () => {
    request('/api.farm/goods/resources/qiniu/upload_token', {
      method: 'GET',
    }).then(
      (response) => {
        setQiniuToken(response.token);
      }
    );
  };
  const getUploadToken = () => {
    getQiNiuToken();
    return true;
  };
  const uploadButton = (
    <div>
      <div className="ant-upload-text">
        <UploadOutlined />
        ??????
      </div>
    </div>
  );
  useEffect(() => {
    props.dispatch({
      type: 'goodsClass/fetchClassTags',
      payload: { page: 1, limit: 99 }, 
    });
    props.dispatch({
      type: 'CreateGoods/getGoodsList',
      payload: {
        query: {
          page: 1,
          limit: 99,
        },
      }, 
    });
    props.dispatch({
      type: 'rollingPicture/fetchRollings',
      payload: {
        query: {
          page: 1,
          limit: 99,
        },
      }, 
    });
  }, []);
  const subRollingPictures = (data) => {
    props.dispatch({
      type: 'rollingPicture/createRollingPicture',
      payload: data,

    });
  };
 
  const handleDeletePictures = (aid) => {
    const { dispatch } = props;
    dispatch({
      type: 'rollingPicture/delRollings',
      payload: {
        tid: aid,
        query: {
          page: 1,
          limit: 10,
        },
      }, 
    });
  };
  const confirmChangePicture = () => {
    props.dispatch({
      type: 'rollingPicture/adjRollingPicture',
      payload: {
        rid,
        picture: oriPicture,
        goods_id: oriId,
        number: oriOrder,
      }, 
    });
    setShowAdj(false);
  };
  const submitChangePicture = () => {
    Modal.confirm({
      mask: false,
      title: '?????????',
      content: '??????????????????????????????',
      okText: '??????',
      cancelText: '??????',
      onOk: confirmChangePicture,
    });
  };
  const handelAdjustPicture = (data) => {
    setShowAdj(true);
    setOriId(data.goods_id);
    setOriOrder(data.oid);
    setOriPicture(data.picture);
    setRid(data.id);
  };
  const handleChangeCancel = () => {
    setShowAdj(false);
  };
  const handleChangeGoodsId = (data) => {
    setOriId(data);
  };
  const comfirmDelPicture = (id) => {
    Modal.confirm({
      mask: false,
      title: '?????????',
      content: '???????????????????????????',
      okText: '??????',
      cancelText: '??????',
      onOk: () => handleDeletePictures(id),
    });
  };
  const selectGoodsClass = (e) => {
    props.dispatch({
      type: 'CreateGoods/getGoodsList',
      payload: {
        query: {
          page: 1,
          limit: 10,
          kind_tag: e,
        },
      }, 
    });
  };
  const handleChangeOrder = (data) => {
    setOriOrder(data);
  };
  const onFinish = (values) => {
    const picture = fileList[0].response.key;
    const pRollingInfos = Object.assign(values, { picture });
    setRollingInfos(pRollingInfos);
    Modal.confirm({
      mask: false,
      title: '?????????',
      content: '??????????????????????????????',
      okText: '??????',
      cancelText: '??????',
      onOk: () => { subRollingPictures(pRollingInfos); },
    });
  };
  const {
    Goods, goodsClassFather, 
    goodsClassChild, rollings, rollingslist,
  } = props;
  for (let i = 0; i < rollings.length; i++) {
    rollings[i] = { ...rollings[i], oid: i };
  }
  return (
    <>
      <Tabs defaultActiveKey="1">
       
        <TabPane tab="???????????????" key="1">
          <Divider orientation="left" plain>????????????</Divider>
          <Table dataSource={rollings}>
            <Column
              title="????????????"
              dataIndex="oid"
              key="oid"
              defaultSortOrder="ascend"
              sorter={(a, b) => a.oid - b.oid}
            />
            <Column
              title="????????????" 
              dataIndex="name"
              key="firstName"
              render={(text, record) => (
                <div style={{ textAlign: 'left' }}>
                  <img
                    src={record ? BASE_QINIU_URL + record.picture : null}
                    alt="img" 
                    style={{ width: 30, height: 30, marginRight: 20  }}
                  />
                </div>
              )}
            />
            <Column
              title="??????"
              key="id"
              render={(text, record) => (
                <Space size="middle">
                  <span>
                    <Icon
                      type="edit"
                      style={{ marginLeft: 8 }}
                    />
                    <a onClick={() => handelAdjustPicture(record)}>??????</a> 
                    <Modal
                      mask={false}
                      title="?????????"
                      visible={showAdj}
                      onOk={submitChangePicture}
                      onCancel={handleChangeCancel}
                      okText="??????"
                      cancelText="??????"
                    >
                      <Divider orientation="left" plain>????????????</Divider>
                      <Select
                        style={{ width: '10vw', marginTop: 10, marginBottom: 20 }}
                        onChange={selectGoodsClass}
                        placeholder="?????????????????????"
                      >
                        {
                goodsClassFather.map((arr) => {
                  return <OptGroup label={arr.title}>
                    {(goodsClassChild.filter((tags) => {
                      return tags.parent_id === arr.id;
                    })).map((tag) => { return <Option value={tag.id}>{tag.title}</Option>; })}
                  </OptGroup>;
                })
              }
                      </Select>
                      <PlusSquareTwoTone />
                      <Divider />
                      <Divider orientation="left" plain>????????????</Divider>
                      <Select
                        style={{ width: '15vw', marginTop: 10, marginBottom: 20 }}
                        showSearch
                        placeholder="??????????????????????????????"
                        optionFilterProp="children"
                        defaultValue={oriId}
                        onChange={handleChangeGoodsId}
                      >
                        {
              Goods.map((arr) => {
                return <Option value={arr.id}>{arr.name}</Option>;
              })
            }

                      </Select>
                      <Divider orientation="left" plain>????????????</Divider>
                      <InputNumber
                        defaultValue={oriOrder} 
                        onChange={handleChangeOrder}
                        value={oriOrder}
                      />
                      <Divider orientation="left" plain>????????????</Divider>
                      <span onClick={getQiNiuToken}>
                        <ImgCrop grid aspect={pictureSize.home_rolling}>
                          <Upload
                            action={QINIU_SERVER}
                            data={
             {
               token: qiniuToken,
               key: `icon-${Date.parse(new Date())}`,
             }
}
                            listType="picture-card"
                            beforeUpload={getQiNiuToken}
                            showUploadList={false}
                      //fileList={oriPicture}
                            onChange={handleChangefile}
                          >
                            {oriPicture ?  <img src={BASE_QINIU_URL + oriPicture} alt="" style={{ height: 80, width: 80 }} /> : uploadButton}
                          </Upload>
                        </ImgCrop>
                      </span>
                      <Upload />
                    </Modal>
                  </span>
                  <a onClick={() => comfirmDelPicture(record.id)}>??????</a>
                </Space>
              )}
            />
  
          </Table>
        </TabPane>
        <TabPane tab="????????????" key="2">
          <Divider>????????????</Divider>
          <Col offset="3">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Select
                style={{
                  width: '57vw', marginTop: 10, marginBottom: 20, marginRight: 10, 
                }}
                onChange={selectGoodsClass}
                placeholder="?????????????????????"
              >
                {
                goodsClassFather.map((arr) => {
                  return <OptGroup label={arr.title}>
                    {(goodsClassChild.filter((tags) => {
                      return tags.parent_id === arr.id;
                    })).map((tag) => { return <Option value={tag.id}>{tag.title}</Option>; })}
                  </OptGroup>;
                })
              }
              </Select>
              <Link to="/goods/add-goods">
                <PlusSquareTwoTone style={{ fontSize: 30,  marginTop: 10, marginRight: 250 }} />
              </Link>
            </div>
          </Col>
          <Divider />
          <Form
            {...layout}
            name="basic"
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
          >
            <Form.Item
              label="????????????"
              name="goods_id"
              rules={[
                {
                  required: true,
                  message: '?????????????????????',
                }
              ]}
            >
              <Select
                showSearch
                placeholder="??????????????????????????????"
                optionFilterProp="children"
              >
                {
              Goods.map((arr) => {
                return <Option value={arr.id}>{arr.name}</Option>;
              })
            }

              </Select>
            </Form.Item>

            <Form.Item
              label="????????????"
              name="number"
              rules={[
                {
                  required: true,
                  message: '????????????????????????',
                }
              ]}
            >
              <InputNumber  />
            </Form.Item>
            <Form.Item
              label="????????????"
              rules={[
                {
                  //required: true,
                }
              ]}
            >
              <>
                <span onClick={getUploadToken}>
                  <ImgCrop grid aspect={pictureSize.home_rolling} quality={1}>
                    <Upload
                      action={QINIU_SERVER}
                      data={{
                        token: qiniuToken,
                        key: `picture-${Date.parse(new Date())}`,
                      }}
                      showUploadList={false}
                      listType="picture-card"
                      beforeUpload={getUploadToken}
                      onPreview={handlePreview}
                      onChange={handleChange}
                    >
                      {fileList[0] ? <img
                        src={fileList[0] 
                          ? BASE_QINIU_URL + fileList[0].response.key : null}
                        alt="avatar"
                        style={{ width: '100%' }}
                      /> :  uploadButton}
                    </Upload>
                  </ImgCrop>
                </span>
              </>
           
            </Form.Item>
            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit">
                ??????
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
    </>
    
  );
};

export default connect(({
  goodsArea, goodsSale, CreateGoods, goodsClass, rollingPicture,
}) => ({
  rollingPicture,
  rollings: get(rollingPicture, 'info', []),
  rollingslist: get(rollingPicture, 'List', []),
  goodsSale: get(goodsSale, 'tags', []),
  goodsArea: get(goodsArea, 'info', []),
  AreaTotal: get(goodsArea, 'total', ''),
  Goods: get(CreateGoods, 'info', []),
  goodsClassFather: get(goodsClass, 'tags', [])
    .filter((arr) => { return arr.parent_id === 0; }),
  goodsClassChild: get(goodsClass, 'tags', [])
    .filter((arr) => { return arr.parent_id !== 0; }),
  GoodsTotal: get(CreateGoods, 'total', ''),
  GoodsAreaTags: goodsArea.GoodsAreaTags,
}))(RollingPictures);
