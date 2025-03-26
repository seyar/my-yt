class ChannelsList extends HTMLElement {
  constructor () {
    super()
    this.channels = []
  }
  connectedCallback () {
    this.render()
  }
  disconnectedCallback () {
    this.unregisterEvents()
  }
  static get observedAttributes() {
    return ['data-list'];
  }

  attributeChangedCallback(name, _, newValue) {
    if (name === 'data-list') {
      this.channels = JSON.parse(this.dataset['list'])
      this.render()
    }
  }
  
  render () {
    if (this.channels.length === 0) this.classList.add('hide')
    else this.classList.remove('hide')
    this.unregisterEvents()
    
    this.innerHTML = /*html*/`
      <details class="channels-container">
        <summary>Channels</summary>
        <div>${this.channels.map(channel => /*html*/`<span tabindex=0 data-channel="${channel}" class="channel">${channel}</span>`).join('')}</div>
      </details>
    `

    this.registerEvents()
  }
  registerEvents() {
    const channels = this.querySelectorAll('.channel')
    channels.forEach(channel => window.utils.addClickListener(channel, this.channelClick.bind(this)))
  }
  unregisterEvents() {
    const channels = this.querySelectorAll('.channel')
    channels.forEach(channel => window.utils.removeClickListener(channel, this.channelClick.bind(this)))
  }
  channelClick(event) {
    const $searchInput = document.querySelector('#search')
    if (!$searchInput) return console.log('missing search field, skipping channel event register')
    const channel = `@${event.target.innerText}`

    const channels = this.querySelectorAll('.channel')
    if ($searchInput.value === channel) {
      $searchInput.value = ''
      event.target.classList.remove('active')
    } else {
      $searchInput.value = channel
      channels.forEach(c => c.classList.remove('active'))
      event.target.classList.add('active')
    }
    $searchInput.dispatchEvent(new Event('keyup'))
    setTimeout(() => document.body.scrollIntoView({ top: 0, behavior: 'smooth' }), 10)
  }
}
customElements.define('channels-list', ChannelsList)
