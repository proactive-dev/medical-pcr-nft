import React from 'react'
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import moment from 'moment'
import { COMMON_DATE_FORMAT } from '../constants/AppConfigs'
import logo from '../assets/images/logo.png'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'SourceHanSansJP',
    fontSize: 12,
    lineHeight: 2,
    paddingTop: 30,
    paddingLeft: 60,
    paddingRight: 60,
    flexDirection: 'column'
  },
  logo: {
    width: 154,
    height: 35,
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  titleContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20
  },
  title: {
    color: '#61dafb',
    letterSpacing: 2,
    fontWeight: 'bold',
    fontSize: 25,
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  label: {
    width: 100
  },
  labelLg: {
    width: 130
  },
  value: {
    fontWeight: 'medium',
    minWidth: 140
  },
  issuedInfoRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    margin: 12
  },
  issueDate: {
    fontWeight: 'bold'
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  userInfoContainer: {
    marginTop: 20
  },
  testInfoContainer: {
    marginTop: 20
  },
  issuerInfoContainer: {
    fontSize: 14,
    marginTop: 30
  },
  subTitle: {
    paddingBottom: 3,
    fontSize: 16,
    fontWeight: 'medium'
  },
  descriptionContainer: {
    flexDirection: 'row',
    marginTop: 10
  },
  description: {
    fontSize: 11,
    textAlign: 'center'
  }
})

const CertificatePDF = (props) => {
  const {id, request, issuer, test} = props
  const {sample, collectionMethod, collectionDate, testMethod, testResult, testResultDate} = test

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image style={styles.logo} src={logo}/>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{'PCR検査証明'}</Text>
        </View>
        <View style={styles.issuedInfoRow}>
          <Text style={styles.label}>交付年月日</Text>
          <Text style={styles.issueDate}>{moment().format(COMMON_DATE_FORMAT)}</Text>
        </View>
        <View style={styles.userInfoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>氏 名</Text>
            <Text style={styles.value}>{request.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>アカウント</Text>
            <Text style={styles.value}>{request.account}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>生年月日</Text>
            <Text style={styles.value}>{request.birthDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>性 別</Text>
            <Text style={styles.value}>{request.gender === 0 ? '男性' : '女性'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>アドレス</Text>
            <Text style={styles.value}>{request.residence}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>電話番号</Text>
            <Text style={styles.value}>{request.phoneNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{request.email}</Text>
          </View>
        </View>
        <View style={styles.testInfoContainer}>
          <Text style={styles.subTitle}>検査情報</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>採取検体</Text>
            <Text style={styles.value}>{sample}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>検体採取方法</Text>
            <Text style={styles.value}>{collectionMethod}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>検体採取日時</Text>
            <Text style={styles.value}>{collectionDate.format(COMMON_DATE_FORMAT)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>検査方法</Text>
            <Text style={styles.value}>{testMethod}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>検査結果</Text>
            <Text style={styles.value}>{testResult === 0 ? '陰性' : '陽性'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>結果判定日時</Text>
            <Text style={styles.value}>{testResultDate.format(COMMON_DATE_FORMAT)}</Text>
          </View>
        </View>
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            {'上記の者を検査を行った結果、その結果は下記のとおりである。よって、この証明を交付する。'}
          </Text>
        </View>
        <View style={styles.issuerInfoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.labelLg}>検査機関名</Text>
            <Text style={styles.value}>{issuer.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.labelLg}>機関住所</Text>
            <Text style={styles.value}>{issuer.residence}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.labelLg}>代表者名</Text>
            <Text style={styles.value}>{issuer.delegateName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.labelLg}>電話番号</Text>
            <Text style={styles.value}>{issuer.phoneNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.labelLg}>Email</Text>
            <Text style={styles.value}>{issuer.email}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

export default CertificatePDF
