const babel = require('@babel/core')
const fs = require('fs')
const React = require('react')
const ReactDOM = require('react-dom')

const siteConfig = require('../../../siteConfig')
const device = require('../../../utils/device')
const Button = require('../button')
const Hyperlink = require('../hyperlink')
const TextArea = require('../text-area')
const TextInput = require('../text-input')

const githubIcon = `${siteConfig.baseUrl}img/home/github-icon.svg`
const mediumIcon = `${siteConfig.baseUrl}img/home/medium-icon.svg`

let registerContactForms = fs.readFileSync(`${__dirname}/register-contact-forms.js`).toString()
registerContactForms = babel.transform(registerContactForms, {
  presets: ['@babel/preset-env'],
  code: true,
  ast: false,
}).code

module.exports = class extends React.Component {
  render() {
    return (
      <div {...this.props} className={`ContactForm ${this.props.className || ''}`}>
        <div className="_title">Get in touch</div>
        <div className="_form">
          <TextInput className="_name">
            <label>Your Name</label>
            <input />
          </TextInput>
          <TextInput className="_email">
            <label>Your Email</label>
            <input />
          </TextInput>
          {device.desktop.active && <br />}
          <TextArea className="_details">
            <label>Your Message</label>
            <input />
          </TextArea>
          <div className="_bottom">
            <Hyperlink className="_channel" href={siteConfig.githubUrl}><img src={githubIcon} alt="github" /></Hyperlink>
            <Hyperlink className="_channel" href={siteConfig.mediumUrl}><img src={mediumIcon} alt="medium" /></Hyperlink>
            <Button className="_send-button" />
          </div>
          <div className="_error-message" />
        </div>
        <script src={`${siteConfig.baseUrl}lib/sweetalert2.all.min.js`} />
        <script dangerouslySetInnerHTML={{ __html: `(function () {${registerContactForms}})()` }} />
      </div>
    )
  }
}
