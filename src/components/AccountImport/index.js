import React, { Component, Fragment } from 'react'
import { I18n } from 'react-redux-i18n'
import { connect } from 'react-redux'
import { Header, Toast } from 'components'
import Button from 'components/Button'
import LoadingImage from 'components/LoadingImage'
import NetworkSelector from 'components/NetworkSelector'
import iost from 'iostJS/iost'
import { privateKeyToPublicKey, publickKeyToAccount } from 'utils/key'
import utils from 'utils'
import ui from 'utils/ui';
import user from 'utils/user';
import _trim from 'lodash/trim'
import * as accountActions from 'actions/accounts'

import './index.scss'

type Props = {

}

const getPassword = () => new Promise((resolve, reject) => {
  chrome.runtime.sendMessage({
    action: 'GET_PASSWORD',
  },(res)=> {
    if(res != ''){
      resolve(res)
    }else {
      reject('no password')
    }
  })
})

class AccountImport extends Component<Props> {

  state = {
    privateKey: '',
    isLoading: false,
    errorMessage: '',
    canBack: true
  }

  componentDidMount() {
    const { locationList } = this.props
    if(locationList[locationList.length-1].indexOf('accountImport') < 0){
      ui.settingLocation('/accountImport')
    }
    chrome.runtime.sendMessage({
      action: 'GET_PASSWORD',
    },async (res)=> {
      if(res){
        try {
          const accounts = await user.getUsers()
          this.setState({
            canBack: accounts.length
          })
        } catch (err) {
          console.log(err)
        }
      }
    })
  }

  onSubmit = async () => {
    this.setState({
      isLoading: true
    })
    const privateKey = _trim(this.state.privateKey)
    const { changeLocation } = this.props
    
    let publicKey, accounts = []
    try {
      publicKey = privateKeyToPublicKey(privateKey)

      let accounts1 = await publickKeyToAccount(publicKey, true)
      let accounts2 = await publickKeyToAccount(publicKey, false)
      
      const password = await user.getLockPassword()
      accounts1 = accounts1.map(item => {
        return {
          name: item.account_info.name,
          network: 'MAINNET',
          privateKey: utils.aesEncrypt(privateKey, password),
          publicKey: publicKey,
        }
      })
      accounts2 = accounts2.map(item => {
        return {
          name: item.account_info.name,
          network: 'TESTNET',
          privateKey: utils.aesEncrypt(privateKey, password),
          publicKey: publicKey,
        }
      })
      accounts = accounts1.concat(accounts2)
    } catch (e) {
      console.log(e)
      publicKey = ''
    }

    const invalidLoginInput = !accounts.length || !privateKey || !publicKey

    if (invalidLoginInput) {
      if (!privateKey) {
        Toast.html(I18n.t('ImportAccount_Tip2'))
      } else if (!publicKey) {
        Toast.html(I18n.t('ImportAccount_Tip3'))
      } else if (!accounts.length) {
        Toast.html(I18n.t('ImportAccount_Tip1'))
      }
      this.setState({
        isLoading: false,
      })
      this.throwErrorMessage()
      return
    }

    try {
      
      accounts = await user.addUsers(accounts)
      const activeAccount = await user.getActiveAccount()
      if(activeAccount){
        changeLocation('/accountManage')
      }else {
        iost.changeNetwork(utils.getNetWork(accounts[0].network))

        iost.rpc.blockchain.getAccountInfo(accounts[0].name)
        .then((accountInfo) => {
          if (!iost.isValidAccount(accountInfo, accounts[0].publicKey)) {
            this.throwErrorMessage()
            return
          }
          iost.changeAccount(accounts[0])

          // iost.loginAccount(accounts[0].name, accounts[0].publicKey)
          chrome.storage.local.set({ activeAccount: accounts[0] },() => {
            changeLocation('/accountManage')
          })
        })
        .catch(this.throwErrorMessage)
      }
      
    } catch (e) {
      console.log(e)
    }
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
      errorMessage: '',
    })
  }

  throwErrorMessage = () => {
    this.setState({
      errorMessage: I18n.t('invalidLoginInfo'),
    })
  }

  // 首次登陆页，或添加账号页
  backTo = () => {
    const { changeLocation, locationList } = this.props
    const { canBack } = this.state
    if(canBack){
      ui.deleteLocation()
      changeLocation(locationList[locationList.length - 1])
    }
  }

  render() {
    const { isLoading, canBack } = this.state
    const { changeLocation, locationList } = this.props
    return (
      <Fragment>
        <Header title={I18n.t('firstLogin_ImportAccount')} logo={!canBack} onBack={this.backTo} hasSetting={false} />
        <div className="accountImport-box">
          <textarea name="privateKey" id="" className="privateKey-content" onChange={this.handleChange} placeholder={I18n.t('ImportAccount_EnterPrivate')}/>

          <Button className="btn-submit" onClick={this.onSubmit}>{isLoading ? <LoadingImage /> : I18n.t('ImportAccount_Submit')}</Button>
        </div>
      </Fragment>
    )
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts.accounts,
  locationList: state.ui.locationList,
})

export default connect(mapStateToProps)(AccountImport)
