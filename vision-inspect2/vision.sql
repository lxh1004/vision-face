-- --------------------------------------------------------
-- 主机:                           127.0.0.1
-- 服务器版本:                        5.7.30 - MySQL Community Server (GPL)
-- 服务器操作系统:                      Linux
-- HeidiSQL 版本:                  11.0.0.5919
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- 导出 vision 的数据库结构
CREATE DATABASE IF NOT EXISTS `vision` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_croatian_ci */;
USE `vision`;

-- 导出  表 vision.atlas 结构
CREATE TABLE IF NOT EXISTS `atlas` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '图册ID',
  `name` varchar(255) NOT NULL COMMENT '图册名称',
  `code` varchar(255) NOT NULL COMMENT '图册编号',
  `position` varchar(255) DEFAULT NULL COMMENT '图册位置',
  `in_charge` varchar(255) DEFAULT NULL COMMENT '图册负责人',
  `manual` text COMMENT '图册说明',
  `organization_id` int(10) unsigned NOT NULL COMMENT '图册所属公司',
  `work_center_id` int(10) unsigned DEFAULT NULL COMMENT '图册所属工作中心',
  `implementation` smallint(6) NOT NULL DEFAULT '0' COMMENT '图册是否部署（推送给报表）：0，不部署；1，部署',
  `analysis` smallint(6) NOT NULL DEFAULT '0' COMMENT '图册是否分析：0，不分析；1，分析',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `organization_id` (`organization_id`),
  KEY `work_center_id` (`work_center_id`),
  CONSTRAINT `atlas_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organization` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `atlas_ibfk_2` FOREIGN KEY (`work_center_id`) REFERENCES `workcenter` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.atlasimage 结构
CREATE TABLE IF NOT EXISTS `atlasimage` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '标准图册ID',
  `atlas_image` varchar(255) NOT NULL COMMENT '标准图册',
  `camera_id` int(10) unsigned DEFAULT NULL COMMENT '设备ID',
  `time` datetime NOT NULL COMMENT '时间',
  `is_delete` smallint(6) NOT NULL DEFAULT '0' COMMENT '是否删除',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `atlas_image` (`atlas_image`) USING BTREE,
  KEY `camera_id` (`camera_id`) USING BTREE,
  CONSTRAINT `atlasimage_ibfk_1` FOREIGN KEY (`camera_id`) REFERENCES `camera` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.atlasimageregion 结构
CREATE TABLE IF NOT EXISTS `atlasimageregion` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '图册图像区域ID',
  `atlas_region_id` int(10) unsigned NOT NULL COMMENT '图册区域ID',
  `camera_id` int(10) unsigned DEFAULT NULL COMMENT '设备ID',
  `region` text NOT NULL COMMENT '区域数组，[{x, y}]',
  `atlas_image_id` int(10) unsigned DEFAULT NULL COMMENT '图册图片ID',
  `atlas_standard_image_id` int(10) unsigned DEFAULT NULL COMMENT '标准图册图片ID',
  `model_type` int(11) DEFAULT NULL COMMENT '算法模型类型',
  `audit` smallint(6) NOT NULL DEFAULT '0' COMMENT '审核状态：0，未审核；1，审核通过',
  PRIMARY KEY (`id`),
  KEY `camera_id` (`camera_id`),
  KEY `atlas_region_id` (`atlas_region_id`),
  KEY `atlas_image_id` (`atlas_image_id`),
  KEY `atlas_standard_image_id` (`atlas_standard_image_id`),
  CONSTRAINT `atlasimageregion_ibfk_1` FOREIGN KEY (`camera_id`) REFERENCES `camera` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `atlasimageregion_ibfk_2` FOREIGN KEY (`atlas_region_id`) REFERENCES `atlasregion` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `atlasimageregion_ibfk_3` FOREIGN KEY (`atlas_image_id`) REFERENCES `atlasimage` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `atlasimageregion_ibfk_4` FOREIGN KEY (`atlas_standard_image_id`) REFERENCES `atlasstandardimage` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.atlasregion 结构
CREATE TABLE IF NOT EXISTS `atlasregion` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '图册区域ID',
  `code` varchar(255) NOT NULL COMMENT '图册区域编码',
  `atlas_id` int(10) unsigned DEFAULT NULL COMMENT '图册ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `atlas_id` (`atlas_id`),
  CONSTRAINT `atlasregion_ibfk_1` FOREIGN KEY (`atlas_id`) REFERENCES `atlas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.atlasrule 结构
CREATE TABLE IF NOT EXISTS `atlasrule` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '图册规则ID',
  `type` int(10) NOT NULL COMMENT '图册类型，0：物料工装，1：6S管理，2：人的行为',
  `rule` varchar(255) DEFAULT NULL COMMENT '图册规则名称',
  `name` varchar(255) DEFAULT NULL COMMENT '图册规则',
  `atlas_image_region_id` int(10) unsigned NOT NULL COMMENT '图册图像区域ID',
  `atlas_image_id` int(10) unsigned DEFAULT NULL COMMENT '图册物料示例图片',
  `region` text COMMENT '图册物料示例区域',
  `image` int(255) unsigned DEFAULT NULL COMMENT '图册图片（已废弃）',
  `enabled` smallint(6) NOT NULL DEFAULT '0' COMMENT '图册规则可用性，0：禁用，1：可用',
  `model_type` varchar(255) DEFAULT NULL COMMENT '算法模型',
  PRIMARY KEY (`id`),
  KEY `atlasrule_ibfk_1` (`atlas_image_region_id`),
  KEY `atlasrule_ibfk_2` (`atlas_image_id`),
  CONSTRAINT `atlasrule_ibfk_1` FOREIGN KEY (`atlas_image_region_id`) REFERENCES `atlasimageregion` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `atlasrule_ibfk_2` FOREIGN KEY (`atlas_image_id`) REFERENCES `atlasimage` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.atlasstandardimage 结构
CREATE TABLE IF NOT EXISTS `atlasstandardimage` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '标准图册图片ID',
  `atlas_id` int(10) unsigned NOT NULL COMMENT '图册ID',
  `camera_id` int(10) unsigned NOT NULL COMMENT '设备ID',
  `atlas_image_id` int(10) unsigned DEFAULT NULL COMMENT '图册图片ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `atlas_id` (`atlas_id`,`camera_id`) USING BTREE,
  KEY `atlas_image_id` (`atlas_image_id`),
  KEY `camera_id` (`camera_id`),
  CONSTRAINT `atlasstandardimage_ibfk_1` FOREIGN KEY (`atlas_id`) REFERENCES `atlas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `atlasstandardimage_ibfk_2` FOREIGN KEY (`atlas_image_id`) REFERENCES `atlasimage` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `atlasstandardimage_ibfk_3` FOREIGN KEY (`camera_id`) REFERENCES `camera` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.camera 结构
CREATE TABLE IF NOT EXISTS `camera` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `name` varchar(255) NOT NULL COMMENT '摄像头名称',
  `ip` varchar(255) DEFAULT NULL COMMENT '摄像头IP',
  `type` int(255) NOT NULL COMMENT '摄像头类型',
  `scene` int(11) DEFAULT NULL COMMENT '业务场景',
  `organization_id` int(10) unsigned DEFAULT NULL COMMENT '组织架构ID',
  `username` varchar(255) DEFAULT NULL COMMENT '摄像头用户名',
  `password` varchar(255) DEFAULT NULL COMMENT '摄像头密码',
  `location_id` int(10) unsigned NOT NULL COMMENT '区域ID',
  `serial_number` varchar(255) DEFAULT NULL COMMENT '序列号',
  `atlas_config` text COMMENT '图册配置',
  `atlas_image` varchar(255) DEFAULT NULL COMMENT '标准图册',
  `available` smallint(5) unsigned NOT NULL DEFAULT '1' COMMENT '可用性，0:停用，1:启用',
  `the_6s_config` text COMMENT '6S配置',
  `direction` smallint(6) DEFAULT NULL COMMENT '进出方向，0进，1出',
  `group` int(11) DEFAULT NULL COMMENT '分组编号',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `not_inspect` smallint(5) unsigned NOT NULL DEFAULT '0' COMMENT '是否进行现场审核，0需要审核，1不需要审核',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ip` (`ip`),
  UNIQUE KEY `serial_number` (`serial_number`),
  KEY `organization_id` (`organization_id`),
  KEY `location_id` (`location_id`),
  CONSTRAINT `camera_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organization` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `camera_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `location` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.cameraface 结构
CREATE TABLE IF NOT EXISTS `cameraface` (
  `camera_id` int(10) unsigned NOT NULL COMMENT '设备ID',
  `organization_id` int(10) unsigned NOT NULL COMMENT '组织机构ID',
  PRIMARY KEY (`camera_id`,`organization_id`) USING BTREE,
  KEY `organization_id` (`organization_id`) USING BTREE,
  CONSTRAINT `cameraface_ibfk_1` FOREIGN KEY (`camera_id`) REFERENCES `camera` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cameraface_ibfk_2` FOREIGN KEY (`organization_id`) REFERENCES `organization` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.cameratag 结构
CREATE TABLE IF NOT EXISTS `cameratag` (
  `camera_id` int(11) unsigned NOT NULL COMMENT '摄像头ID',
  `tag` int(11) NOT NULL COMMENT '标签',
  PRIMARY KEY (`camera_id`,`tag`) USING BTREE,
  CONSTRAINT `cameratag_ibfk_1` FOREIGN KEY (`camera_id`) REFERENCES `camera` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.cameratechnique 结构
CREATE TABLE IF NOT EXISTS `cameratechnique` (
  `camera_id` int(10) unsigned NOT NULL,
  `technique_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`camera_id`,`technique_id`),
  KEY `technique_id` (`technique_id`),
  CONSTRAINT `cameratechnique_ibfk_1` FOREIGN KEY (`camera_id`) REFERENCES `camera` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cameratechnique_ibfk_2` FOREIGN KEY (`technique_id`) REFERENCES `technique` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.cameraworkcenter 结构
CREATE TABLE IF NOT EXISTS `cameraworkcenter` (
  `camera_id` int(10) unsigned NOT NULL COMMENT '摄像头ID',
  `work_center_id` int(10) unsigned NOT NULL COMMENT '工作中心ID',
  PRIMARY KEY (`camera_id`,`work_center_id`) USING BTREE,
  KEY `work_center_id` (`work_center_id`) USING BTREE,
  CONSTRAINT `cameraworkcenter_ibfk_1` FOREIGN KEY (`camera_id`) REFERENCES `camera` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cameraworkcenter_ibfk_2` FOREIGN KEY (`work_center_id`) REFERENCES `workcenter` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.camera_copy1 结构
CREATE TABLE IF NOT EXISTS `camera_copy1` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `name` varchar(255) NOT NULL COMMENT '摄像头名称',
  `ip` varchar(255) DEFAULT NULL COMMENT '摄像头IP',
  `type` int(255) NOT NULL COMMENT '摄像头类型',
  `scene` int(11) DEFAULT NULL COMMENT '业务场景',
  `organization_id` int(10) unsigned DEFAULT NULL COMMENT '组织架构ID',
  `username` varchar(255) DEFAULT NULL COMMENT '摄像头用户名',
  `password` varchar(255) DEFAULT NULL COMMENT '摄像头密码',
  `location_id` int(10) unsigned NOT NULL COMMENT '区域ID',
  `serial_number` varchar(255) DEFAULT NULL COMMENT '序列号',
  `atlas_config` text COMMENT '图册配置',
  `atlas_image` varchar(255) DEFAULT NULL COMMENT '标准图册',
  `available` smallint(5) unsigned NOT NULL DEFAULT '1' COMMENT '可用性，0:停用，1:启用',
  `the_6s_config` text COMMENT '6S配置',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ip` (`ip`),
  UNIQUE KEY `serial_number` (`serial_number`),
  KEY `organization_id` (`organization_id`),
  KEY `location_id` (`location_id`),
  CONSTRAINT `camera_copy1_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organization` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `camera_copy1_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `location` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.contact 结构
CREATE TABLE IF NOT EXISTS `contact` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `tel` varchar(255) DEFAULT NULL,
  `mail` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.cvr 结构
CREATE TABLE IF NOT EXISTS `cvr` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'CVR ID',
  `ip` varchar(255) NOT NULL COMMENT 'CVR IP',
  `username` varchar(255) NOT NULL COMMENT 'CVR用户名',
  `password` varchar(255) NOT NULL COMMENT 'CVR密码',
  `location_id` int(10) unsigned NOT NULL COMMENT '区域ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ip` (`ip`),
  KEY `location_id` (`location_id`),
  CONSTRAINT `cvr_ibfk_1` FOREIGN KEY (`location_id`) REFERENCES `location` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.dictionary 结构
CREATE TABLE IF NOT EXISTS `dictionary` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '字典ID',
  `group_key` varchar(255) NOT NULL COMMENT '字典组键值',
  `label` varchar(255) NOT NULL COMMENT '字典标签',
  `value` varchar(255) NOT NULL COMMENT '字典值',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.inspect 结构
CREATE TABLE IF NOT EXISTS `inspect` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '现场审核ID',
  `camera_id` int(10) unsigned NOT NULL COMMENT '设备ID',
  `time` datetime NOT NULL COMMENT '计划抓图时间',
  `capture_time` datetime DEFAULT NULL COMMENT '实际抓图时间（已废弃）',
  `region` text COMMENT '审核区域',
  `audit` smallint(6) DEFAULT NULL COMMENT '审核状态',
  `capture_url` varchar(255) DEFAULT NULL COMMENT '抓图URL',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `camera_id` (`camera_id`) USING BTREE,
  CONSTRAINT `inspect_ibfk_1` FOREIGN KEY (`camera_id`) REFERENCES `camera` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.inspect2 结构
CREATE TABLE IF NOT EXISTS `inspect2` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '现场审核ID',
  `camera_id` int(10) unsigned NOT NULL COMMENT '设备ID',
  `time` datetime NOT NULL COMMENT '计划抓图时间',
  `capture_time` datetime DEFAULT NULL COMMENT '实际抓图时间',
  `region` text COMMENT '审核区域',
  `audit` smallint(6) DEFAULT '0' COMMENT '审核状态',
  `capture_url` varchar(255) DEFAULT NULL COMMENT '抓图URL',
  `rectify` smallint(6) NOT NULL DEFAULT '0' COMMENT '待整改设备，0正常，1待整改',
  `confidence` double DEFAULT NULL COMMENT '置信度',
  `msg` varchar(512) DEFAULT '' COMMENT '抓图失败描述',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `camera_id` (`camera_id`) USING BTREE,
  KEY `time` (`time`),
  KEY `capture_time` (`capture_time`),
  KEY `confidence` (`confidence`) USING BTREE,
  KEY `time_confidence` (`time`,`confidence`)
) ENGINE=InnoDB AUTO_INCREMENT=221452 DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.location 结构
CREATE TABLE IF NOT EXISTS `location` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `name` varchar(255) NOT NULL COMMENT '区域名称',
  `pangu_code` varchar(255) DEFAULT NULL COMMENT '盘古服务器代号',
  `pangu_ip` varchar(255) DEFAULT NULL COMMENT '盘古服务器IP',
  `pangu_pad_ip` varchar(255) DEFAULT NULL COMMENT '盘古服务器一体机图片下发服务IP',
  `pangu_worker_ip` varchar(255) DEFAULT NULL COMMENT '盘古服务器pangu-worker IP',
  `alarm_interval` int(10) DEFAULT NULL COMMENT '告警间隔时间（秒）',
  `alarm_times` int(10) DEFAULT NULL COMMENT '告警次数',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `code` (`pangu_code`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.locationcontact 结构
CREATE TABLE IF NOT EXISTS `locationcontact` (
  `location_id` int(10) unsigned NOT NULL,
  `contact_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`location_id`,`contact_id`),
  KEY `contact_id` (`contact_id`),
  CONSTRAINT `locationcontact_ibfk_1` FOREIGN KEY (`location_id`) REFERENCES `location` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `locationcontact_ibfk_2` FOREIGN KEY (`contact_id`) REFERENCES `contact` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.logoffline 结构
CREATE TABLE IF NOT EXISTS `logoffline` (
  `camera_id` int(10) unsigned NOT NULL COMMENT '设备ID',
  `time` date NOT NULL COMMENT '日志时间（天）',
  `offline_time` int(10) unsigned NOT NULL COMMENT '掉线时长（分钟）',
  PRIMARY KEY (`camera_id`,`time`),
  CONSTRAINT `logoffline_ibfk_1` FOREIGN KEY (`camera_id`) REFERENCES `camera` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.logonline 结构
CREATE TABLE IF NOT EXISTS `logonline` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `time` datetime NOT NULL COMMENT '状态时间',
  `location_id` int(10) unsigned NOT NULL COMMENT '区域ID',
  `online` int(10) unsigned NOT NULL COMMENT '设备在线数',
  `offline` int(10) unsigned NOT NULL COMMENT '设备离线数',
  `online_face` int(10) unsigned NOT NULL COMMENT '人脸设备在线数',
  `offline_face` int(10) unsigned NOT NULL COMMENT '人脸设备离线数',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `location_id` (`location_id`) USING BTREE,
  CONSTRAINT `logonline_ibfk_1` FOREIGN KEY (`location_id`) REFERENCES `location` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.logonlinediff 结构
CREATE TABLE IF NOT EXISTS `logonlinediff` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `time` datetime NOT NULL,
  `ip` varchar(255) NOT NULL,
  `location_id` int(10) unsigned NOT NULL,
  `online` smallint(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.organization 结构
CREATE TABLE IF NOT EXISTS `organization` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '区域ID',
  `name` varchar(255) NOT NULL COMMENT '区域名称',
  `pid` int(11) DEFAULT NULL COMMENT '父级区域ID',
  `atlas_count` int(10) unsigned NOT NULL COMMENT '图册数量',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.role 结构
CREATE TABLE IF NOT EXISTS `role` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  `name` varchar(255) NOT NULL COMMENT '角色名称',
  `super` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否为超级管理员角色',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.roleauthorization 结构
CREATE TABLE IF NOT EXISTS `roleauthorization` (
  `role_id` int(10) unsigned NOT NULL COMMENT '角色ID',
  `location_id` int(10) unsigned NOT NULL COMMENT '区域ID',
  PRIMARY KEY (`role_id`,`location_id`),
  KEY `location_id` (`location_id`),
  CONSTRAINT `roleauthorization_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `roleauthorization_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `location` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.setting6s 结构
CREATE TABLE IF NOT EXISTS `setting6s` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '6S配置id',
  `type` int(11) NOT NULL COMMENT '6S配置类型：0为全局配置，1为公司配置，2为摄像头配置',
  `value` text COMMENT '6S配置规则：type为0时值为null，type为1时值为公司id，type为2时值为摄像头id',
  `time` text NOT NULL COMMENT '6S配置时间',
  `tag` text COMMENT '6S配置标签',
  `interval` int(11) DEFAULT NULL COMMENT '6S配置时间间隔',
  `order` int(10) unsigned NOT NULL COMMENT '6S配置匹配顺序',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.settingface 结构
CREATE TABLE IF NOT EXISTS `settingface` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '人脸服务配置ID',
  `device_type` int(10) unsigned NOT NULL COMMENT '设备配置类型',
  `device_value` text COMMENT '设备配置对象',
  `staff_type` int(11) NOT NULL COMMENT '员工配置类型',
  `staff_value` text COMMENT '员工配置对象',
  `rule` smallint(6) NOT NULL COMMENT '配置规则',
  `order` int(10) unsigned NOT NULL COMMENT '顺序',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.syncisc 结构
CREATE TABLE IF NOT EXISTS `syncisc` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ISC平台ID',
  `name` varchar(255) NOT NULL COMMENT 'ISC平台名称',
  `ip` varchar(255) NOT NULL COMMENT 'ISC平台IP',
  `appkey` varchar(255) NOT NULL COMMENT 'ISC平台同步应用appKey',
  `appsecret` varchar(255) NOT NULL COMMENT 'ISC平台同步应用appSecret',
  `default_username` varchar(255) NOT NULL COMMENT '同步数据时的默认用户名',
  `default_password` varchar(255) NOT NULL COMMENT '同步数据时的默认密码',
  `default_location` int(10) unsigned DEFAULT NULL COMMENT '同步数据时的默认区域',
  `default_organization` int(10) unsigned DEFAULT NULL COMMENT '同步数据时的默认组织机构',
  `cron` varchar(255) DEFAULT NULL COMMENT '自动同步数据计划任务时间参数（linux/cron风格）',
  PRIMARY KEY (`id`),
  KEY `default_location` (`default_location`),
  KEY `default_organization` (`default_organization`),
  CONSTRAINT `syncisc_ibfk_1` FOREIGN KEY (`default_location`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `syncisc_ibfk_2` FOREIGN KEY (`default_organization`) REFERENCES `organization` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.technique 结构
CREATE TABLE IF NOT EXISTS `technique` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `name` varchar(255) NOT NULL COMMENT '工艺名称',
  `code` varchar(255) DEFAULT NULL COMMENT '工艺代码',
  `pid` int(10) unsigned DEFAULT NULL COMMENT '父级工艺ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.user 结构
CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `name` varchar(255) DEFAULT NULL COMMENT '用户昵称',
  `username` varchar(255) NOT NULL COMMENT '用户名',
  `password` varchar(255) DEFAULT NULL COMMENT '加密后密码',
  `salt` varchar(255) DEFAULT NULL COMMENT '密码盐',
  `role_id` int(10) unsigned DEFAULT NULL COMMENT '角色ID',
  `is_sso` smallint(6) NOT NULL DEFAULT '0' COMMENT '是否为域账号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`) USING BTREE COMMENT '用户名不可重复',
  KEY `user_ibfk_1` (`role_id`),
  CONSTRAINT `user_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.userauthorization 结构
CREATE TABLE IF NOT EXISTS `userauthorization` (
  `user_id` int(10) unsigned NOT NULL COMMENT '用户ID',
  `organization_id` int(10) unsigned NOT NULL COMMENT '组织机构ID',
  `user_auth_type` int(11) NOT NULL COMMENT '用户权限类型',
  PRIMARY KEY (`user_id`,`organization_id`,`user_auth_type`),
  KEY `organization_id` (`organization_id`),
  CONSTRAINT `userauthorization_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `userauthorization_ibfk_2` FOREIGN KEY (`organization_id`) REFERENCES `organization` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

-- 导出  表 vision.workcenter 结构
CREATE TABLE IF NOT EXISTS `workcenter` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '工作中心ID',
  `name` varchar(255) NOT NULL COMMENT '工作中心名称',
  `organization_id` int(10) unsigned NOT NULL COMMENT '公司ID',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `organization_id` (`organization_id`) USING BTREE,
  CONSTRAINT `workcenter_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organization` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
