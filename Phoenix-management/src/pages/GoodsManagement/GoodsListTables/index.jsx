import React from 'react';
import {
  Table, Tag, Space,
  Modal, Input, Select, Button
} from 'antd';
import moment from 'moment';
import { connect, Link } from 'umi';
import { get } from 'lodash';
import { PlusCircleTwoTone, RedoOutlined } from '@ant-design/icons';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import PropTypes from 'prop-types';
import GoodsAdj from './GoodsAdj';
import TempalteAdj from './TemplateAdj';
import  './index.less';

const { Column } = Table;
const { Option, OptGroup } = Select;
const BASE_QINIU_URL = 'http://qiniu.fmg.net.cn/';
@connect(({
  goodsArea, goodsSale, CreateGoods, goodsClass, 
}) => ({
  goodsSale: get(goodsSale, 'tags', []),
  goodsArea: get(goodsArea, 'info', []),
  AreaTotal: get(goodsArea, 'total', ''),
  Goods: (get(CreateGoods, 'info', []) ?? []),
  goodsClassFather: get(goodsClass, 'tags', [])
    .filter((arr) => { return arr.parent_id === 0; }),
  goodsClassChild: get(goodsClass, 'tags', [])
    .filter((arr) => { return arr.parent_id !== 0; }),
  GoodsTotal: get(CreateGoods, 'total', ''),
  GoodsAreaTags: goodsArea.GoodsAreaTags,
})) 

class GoodsList extends React.Component {
  constructor() {
    super();
    this.state = {
      tagsAreaCheck: 0,
      tagsSaleCheck: 0,
      specification: {},
      template: [],
      templateId: 0, 
      visible: false,
      sale: true,
      gid: 0,
      visableTem: false,
      FilterText: '',
      pageSize: 5,
      current: 1,
      record: {},
    };
  }

  componentDidMount() {
    const { dispatch, pageSize } = this.props;
    dispatch({
      type: 'CreateGoods/getGoodsList',
      payload: {
        query: {
          page: 1,
          limit: 5,
        },
      }, 
    });
    dispatch({
      type: 'goodsArea/fetchAreaTags',
      payload: {
        query: {
          page: 1,
          limit: 10,
        },
      },  
    });
    dispatch({
      type: 'goodsClass/fetchClassTags',
      payload: { page: 1, limit: 99 }, 
    });
    dispatch({
      type: 'goodsSale/fetchSaleTags',
      payload: { page: 1, limit: 99 }, 
    });
  }

  reloadSelector = () => {
    const { dispatch } = this.props;
    const { current } = this.state;
    this.setState({
      tagsAreaCheck: 0,
      tagsSaleCheck: 0,
      FilterText: '',
    }, () => {
      dispatch({
        type: 'CreateGoods/getGoodsList',
        payload: {
          query: {
            page: current,
            limit: 10,
            place_tag: 0,
            sale_tag: 0,
          },
        }, 
      }); 
    });
  }

  showModal = (text) => {
    this.setState({
      visible: true,
      record: text,
    });
  };

  showModalTem = (data, tid, templateData, id, sale) => {
    this.setState({
      specification: data,
      gid: tid,
      template: templateData,
      templateId: id,
      sale,
      visableTem: true,
    });
  };

  confirm(id) {
    Modal.confirm({
      mask: false,
      title: '?????????',
      content: '???????????????????????????',
      okText: '??????',
      cancelText: '??????',
      onOk: () => this.handleDelete(id),
    });
  }

  changePage=(current) => {
    this.setState({
      current,
    });
    const { dispatch } = this.props;
    dispatch({
      type: 'CreateGoods/getGoodsList',
      payload: {
        query: {
          page: current,
          limit: 5,
        },
      }, 
    });
  }

  selectAreaItem = (item) => {
    const { dispatch } = this.props;
    const { current, tagsSaleCheck } = this.state;
    this.setState({
      tagsAreaCheck: item,
    }, () => {
      dispatch({
        type: 'CreateGoods/getGoodsList',
        payload: {
          query: {
            page: current,
            limit: 10,
            place_tag: item,
            sale_tag: tagsSaleCheck,
          },
        }, 
      }); 
    });
  }

  selectSaleItemAll = () => {
    const { dispatch } = this.props;
    const { current, tagsAreaCheck } = this.state;
    this.setState({
      tagsSaleCheck: 0,
    }, () => {
      dispatch({
        type: 'CreateGoods/getGoodsList',
        payload: {
          query: {
            page: current,
            limit: 10,
            place_tag: tagsAreaCheck,
            sale_tag: 0,
          },
        }, 
      });
    });
  }

  selectSaleItem = (checked, item) => {
    const { dispatch } = this.props;
    const { current, tagsAreaCheck } = this.state;
    this.setState({
      tagsSaleCheck: item.id,
    }, () => {
      dispatch({
        type: 'CreateGoods/getGoodsList',
        payload: {
          query: {
            page: current,
            limit: 10,
            place_tag: tagsAreaCheck,
            sale_tag: item.id,
          },
        }, 
      }); 
    });
  }

  selectClassItem = (item) => {
    const { dispatch } = this.props;
    const { current, tagsAreaCheck, tagsSaleCheck } = this.state;
    this.setState({
      tagsClassCheck: item.id,
    }, () => {
      dispatch({
        type: 'CreateGoods/getGoodsList',
        payload: {
          query: {
            page: current,
            limit: 10,
            place_tag: tagsAreaCheck,
            sale_tag: tagsSaleCheck,
            kind_tag: item,
          },
        }, 
      }); 
    });
  }

  MainTextOnChange = (e) => {
    this.setState({ FilterText: e.target.value }, () => { this.handleGetListData(); });
  };

  closeVisable = () => {
    this.setState({
      visible: false,
      visableTem: false,
    });
  }

  handleGetListData = () => {
    const { current, FilterText } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'CreateGoods/getGoodsList',
      payload: { query: { page: current, limit: 10, keyword: FilterText } }, 
    });
  };

  handleDelete = (data) => {
    const {  current } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'CreateGoods/delGoods',
      payload: {
        tid: data.id,
        query: {
          page: current,
          limit: 10,
        },
      }, 
    });
  };

  handleCancel = () => {
    this.setState({ visible: false, visableTem: false });
  };

  render() {
    const {
      pageSize, current,
      tagsSaleCheck, visible, visableTem, template, specification, gid, 
      sale, templateId,
    } = this.state;
    const {
      goodsClassChild, 
      Goods, GoodsTotal, 
      goodsClassFather, goodsArea,
      goodsSale,
    } = this.props;
    const GoodsInfos = (Goods).map((arr, index) => {
      return { key: index, ...arr };
    });
    for (let i = 0; i < goodsClassFather.length; i++) {
      for (let j = 0; j < goodsClassChild.length; j++) {
        if (goodsClassFather[i].id === goodsClassChild[j].parent_id) {
          goodsClassChild[j] = { ...goodsClassChild[j], parent: goodsClassFather[i].title };
        }
      }
    }
    const goodsAreaList = [{ place: '??????', id: 0 }, ...goodsArea];
    const paginationProps = {
      showQuickJumper: false,
      showTotal: () => `???${GoodsTotal}???`,
      pageSize,
      current,
      total: GoodsTotal,
      onChange: (current) => this.changePage(current),
    };

    return (
      <PageHeaderWrapper>
        <div className="goods-list-container">
          <Link to="/goods/add-goods">
            <Button
              type="primary"
              style={{
                margin: 20,
              }}
              icon={<PlusCircleTwoTone />}
            >
              ????????????
            </Button>
          </Link>
          <div className="goods-list-selector">
            <Space size="large">
              <span className="good-selector-items">
                <span>
                  ????????????: 
                </span>
                <Input
                  className="goods-selector-name" 
                  onChange={this.MainTextOnChange}
                  placeholder="????????????????????????"
                />
              </span>
              <span className="good-selector-items">
                <span>
                  ????????????: 
                </span>
                <Select
                  className="goods-selector-class"
                  onChange={this.selectClassItem}
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
              </span>
              <span className="good-selector-items">
                <span>
                  ????????????: 
                </span>
                <Select
                  className="goods-selector-area"
                  onChange={this.selectAreaItem}
                  placeholder="?????????????????????"
                  defaultValue={0}
                >
                  {
                goodsAreaList.map((arr) => {
                  return <Option value={arr.id}>{arr.place}</Option>;
                })
              }
                </Select>
              </span>
              <Button
                type="primary"
                onClick={this.reloadSelector}
                icon={<RedoOutlined />}
              >
                ??????
              </Button>
            </Space>
          </div>
          {/* <Divider orientation="left" plain>????????????</Divider> */}
          <div className="Goods-Class-Tags-selector">
          
            {
           
              <Tag.CheckableTag 
                onClick={() => this.selectSaleItemAll()}
                checked={tagsSaleCheck === 0}
              >
                ??????
              </Tag.CheckableTag>
}
            {
           goodsSale.map((arr) => {
             return <Tag.CheckableTag
               checked={tagsSaleCheck === arr.id}
               onChange={(e) => this.selectSaleItem(e, arr)}
             >
               {
           arr.title
}
             </Tag.CheckableTag>; 
           })
        
}
         
          </div>

          <Table dataSource={GoodsInfos} pagination={paginationProps} bordered>
            <Column
              title="????????????"
              dataIndex="id"
              key="id"
              defaultSortOrder="descend"
              sorter={(a, b) => a.id - b.id}
            />
            <Column
              title="????????????" 
              dataIndex="name"
              width="20%"
              key="firstName"
              render={(text, record) => (
                <div style={{ textAlign: 'left' }}>
                  <img
                    src={record ? BASE_QINIU_URL + record.cover : null}
                    alt="img" 
                    style={{ width: 30, height: 30, marginRight: 20  }}
                  />
                  <span>{text}</span>
                </div>
              )}
            />
            <Column
              title="?????????"
              dataIndex="total"
              key="total"
              defaultSortOrder="descend"
              sorter={(a, b) => a.total - b.total}
            />
            <Column
              title="????????????"
              dataIndex="people"
              key="people"
              defaultSortOrder="descend"
              sorter={(a, b) => a.people - b.people}
            />
            <Column
              title="????????????"
              dataIndex="month_sale"
              key="amount"
              defaultSortOrder="descend"
              sorter={(a, b) => a.amount - b.amount}
            />
          
            <Column
              title="????????????"
              dataIndex="update_time"
              key="update_time"
              render={(updateTime) => (
                <>
                  <span>
                    {moment(updateTime * 1000)
                      .format('YYYY-MM-DD HH:mm:ss')}
                  </span>
                </>
              )}
            />
            <Column
              width="20%"
              title="??????"
              key="index"
              render={(_, text, index) => (
                <Space size="middle" key={index}>
                  <Tag
                    onClick={() => this.showModal(text)} 
                    key={text}
                    color="#108ee9"
                  >
                    ????????????
                  </Tag> 
                  
                  <Tag
                    color="#2db7f5" 
                    onClick={() => this.showModalTem(
                      text.specification,
                      text.id,
                      text.template,
                      text.template_id,
                      text.sale
                    )}
                  >
                    ????????????
                  </Tag> 
                  <Tag onClick={() => this.confirm(text)} color="#f50">????????????</Tag>
                </Space>
              )}
            />
          </Table>
          <div>
            <Modal 
              mask={false}
              width="70vw"
              height="80vh"
              visible={visible}
              title="????????????"
              onOk={this.handleOk}
              onCancel={this.handleCancel}
              footer={null}
              destroyOnClose
            >
                      
              <GoodsAdj
                info={this.state.record} 
                closeModel={() => this.closeVisable()}
              />
            </Modal>
          </div>
          <div>
            <Modal 
              mask={false}
              width="70vw"
              height="80vh"
              visible={visableTem}
              title="??????"
              onOk={this.handleOk}
              onCancel={this.handleCancel}
              footer={null}
              destroyOnClose
            >
              <TempalteAdj
                template={template} 
                info={specification} 
                id={templateId}
                gid={gid}
                ifSale={sale}
                closeModel={() => this.closeVisable()}
              />
            </Modal>
          </div>
        </div>
      </PageHeaderWrapper>
    );
  }
}

GoodsList.propTypes = {
  goodsClassChild: PropTypes.arrayOf({}),
  Goods: PropTypes.arrayOf({}),
  GoodsTotal: PropTypes.number, 
  goodsClassFather: PropTypes.arrayOf({}),
  goodsArea: PropTypes.arrayOf({}),
  goodsSale: PropTypes.arrayOf({}),
};
GoodsList.defaultProps = {
  goodsArea: [],
  goodsSale: [],
  goodsClassFather: [],
  Goods: [],
  goodsClassChild: [],
  GoodsTotal: [],
};

export default () => (
  <div>
    <div id="components-table-demo-reset-filter">
      <GoodsList />
    </div>
  </div>
);
