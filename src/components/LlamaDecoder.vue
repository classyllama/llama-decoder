<template>
  <div class="llama-decoder">
    <div v-if="!entered" class="text-center">
      <h1><span class="glitch" data-text="Llama Nation">Llama Nation</span><br> <span v-if="name">Agent {{ name }}</span></h1>
      <p v-if="!accessGranted && !accessDenied">Verifying Access...<br>&nbsp;</p>
      <p v-if="accessGranted">ACCESS GRANTED<br><a href="#" @click.prevent="entered = true">Enter</a></p>
      <p class="text-danger" v-if="accessDenied">ACCESS DENIED<br>&nbsp;</p>
    </div>
    <div v-if="entered">
      <form>
        <div v-if="step == -1">{{ loadText }}</div>
        <div v-if="step == 0">
          <h2 class="text-center mb-3">Verify your identity</h2>
          <div class="form-group">
            <!-- <label for="file_num">File #</label> -->
            <input required v-model="fileNum" type="number" class="form-control" id="file_num" aria-describedby="file_num_help" placeholder="Enter File #" autofocus>
            <small id="file_num_help" class="form-text text-muted">Found on the top of your mission briefing folder.</small>
          </div>
          <div class="form-group">
            <!-- <label for="project_name">Project Name</label> -->
            <input required v-model="projectName" type="text" class="form-control" id="project_name" aria-describedby="project_name_help" placeholder="Enter Project Name">
            <small id="project_name_help" class="form-text text-muted">Found on the top of your mission briefing folder.</small>
          </div>
          <div class="form-group">
            <button :disabled="!fileNum || !projectName" class="btn btn-secondary btn-block" type="submit" @click.prevent="loadStep(step1)">Next</button>
          </div>
        </div>
        <div v-if="step == 1" class="form-group">
          <h2 class="text-center mb-3">Enter confirmation code</h2>
          <!-- <label for="notes_num">Mobile Device Confirmation Code</label> -->
          <input required v-model="notesNum" type="number" class="form-control" id="notes_num" aria-describedby="notes_num_help" placeholder="Enter Confirmation Code" autofocus>
          <small id="notes_num_help" class="form-text text-muted">Found in Notes app of your mission-issued mobile device.</small>
          <br>
          <button :disabled="!notesNum" class="btn btn-secondary btn-block" type="submit" @click.prevent="loadStep(step2)">Confirm</button>
        </div>
        <div v-if="step == 2" class="form-group text-center">
          <p v-if="recordFound">Confirmed. Scanning your network...</p>
          <div v-if="!recordFound">
            <h2 class="text-center mb-3">Confirmation code is invalid.</h2>
            <pre><code>{{ pid }}</code></pre>
            <p><a href="#" @click.prevent="loadStep(step0, 'Loading...')">Try again</a></p>
          </div>
        </div>
        <div v-if="step == 3" class="form-group text-center">
          <div v-if="recordFound">
            <h2 class="text-center mb-3">Tracking source discovered!</h2>
            <pre><code>id: {{ pid }}</code></pre>
            <h4>View suspected source at <a :href="redirect" @click.prevent="loadStep(step4, 'Redirecting...')">classyllama.com?p={{ pid }}</a></h4>
          </div>
          <div v-if="!recordFound">
            <p>Unable to find any tracking source.</p>
            <pre><code>{{ pid }}</code></pre>
            <p><a href="#" @click.prevent="loadStep(step0, 'Loading...')">Try again</a></p>
          </div>
        </div>
        <div v-if="step == 4" :class="['iframe-wrapper', {'reveal': reveal}]">
          <iframe :src="redirect" frameborder="0"></iframe>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
function findGetParameter(parameterName) {
  var result = null,
    tmp = [];
  var items = location.search.substr(1).split('&');
  for (var index = 0; index < items.length; index++) {
    tmp = items[index].split('=');
    if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
  }
  return result;
}

const DELAY = 2000;
// const DELAY = 0;
const POST_IDS = [
  8896, // Chris Foley
  8866, // Chad Turner
  8836, // Pierson Kellogg
  8804, // Emily Johns
  8769, // Stephen Biston
  8767, // Jared Burgess
  8745, // Joe Langford
  8742, // Greg Johnson
  8682, // Josh Good
  8623, // Jon Richards
  8478, // Audrey Adkins
  7986, // Jeremy Turner
  7989, // Miguel Solano
  7979, // Preston Choate
  7966, // Shawn Brandwein
  7980, // Sean Templeton
  7977, // Timothy Rhodes
  7974, // Francois Muller
  7968, // Noelle Missant
  7967, // Ashley Gates
  7964, // Nichele Cantrell
  7944, // Greg Goodale
  7891, // Austin Wakeman
  7868, // Amy Sisco
  7751, // Rob Young
  6065, // Jonathan Hodges
  6092, // Eric Wiese
  6091, // Brandon Urich
  6090, // Julia Turnage
  6089, // Mike Tull
  6088, // Brendan Tull
  6087, // Nathan Toombs
  6086, // Kurt Theobald
  6085, // Matthew Swinney
  6084, // Richard Sisco
  6083, // Aaron Sheehan
  6082, // Curtis Schrum
  6081, // Katy Rudy
  6080, // Nylah Rogers
  6079, // Adam Prost
  6078, // Jordan Phillips
  6075, // Zach Nanninga
  6074, // Gino Nanninga
  6073, // Chris Nanninga
  6076, // Dalton Marler
  6070, // Ben Leach
  6068, // Matt Johnson
  6067, // Chris Huffman
  6066, // Perry Holden
  6064, // Larry Goodhue
  6063, // Konstantin Filippov
  6062, // Michael Eck
  6061, // Paul Ebisch
  6060, // Allison Duncan
  6059, // Josh Courville
  6058, // Jayme McCrimmons
  6056, // Alexey Bordachyov
  6053, // Zach Allgood
  6052, // David Alger
  6051, // Erik Hansen
  6047, // Ashlee Colliver
  242, // Rob Tull
  236, // Kevin Kirchner
];

export default {
  name: 'LlamaDecoder',
  data() {
    return {
      name: findGetParameter('name'),
      accessGranted: false,
      accessDenied: false,
      entered: false,
      step: 0,
      fileNum: null,
      notesNum: null,
      projectName: null,
      loadText: 'Loading...',
      xz12yk: findGetParameter('xz12yk'),
      reveal: false,
    };
  },
  created() {
    setTimeout(() => {
      if (this.name && this.xz12yk == 417) {
        this.accessGranted = true;
      } else {
        this.accessDenied = true;
      }
    }, DELAY);
  },
  computed: {
    fname() {
      return this.name.split(' ')[0] || '';
    },
    lname() {
      return this.name.split(' ')[1] || '';
    },
    pid() {
      let C = this.fname ? this.fname.charCodeAt() : 1;
      let D = this.lname ? this.lname.charCodeAt() : 1;
      let d = new Date();
      let E = parseFloat(d.getMonth(), 10) + 1;
      let F = parseFloat(d.getDate(), 10);
      let G = parseFloat(d.getFullYear(), 10);
      let J = this.notesNum;
      let L = this.projectName
        ? this.projectName.toUpperCase().charCodeAt()
        : 1;
      let M = this.fileNum;
      return Math.round(C * D / E * F / G * J * L - M);
    },
    recordFound() {
      return POST_IDS.indexOf(this.pid) !== -1;
    },
    redirect() {
      return `https://www.classyllama.com?p=${this.pid}`;
    },
  },
  methods: {
    loadStep(func, loadText = null) {
      this.step = -1;
      this.loadText = loadText || this.loadText;
      setTimeout(() => {
        func.bind(this)();
      }, DELAY);
    },
    step0() {
      this.fileNum = null;
      this.projectName = null;
      this.notesNum = null;
      this.step = 0;
    },
    step1() {
      this.step = 1;
    },
    step2() {
      this.step = 2;
      setTimeout(() => {
        if (this.recordFound) this.step = 3;
      }, DELAY * 2);
    },
    step4() {
      this.step = 4;
      setTimeout(() => {
        this.reveal = true;
      }, DELAY);
      // window.location.href = this.redirect;
    },
  },
};
</script>

<style scoped lang="scss">
$gray-darkest: #191919;
$gray-darker: #333;
$gray-dark: #4a4a4a;
$gray: #777;
$gray-light: #919191;
$gray-lighter: #aaa;
$gray-lightest: #ddd;

$cl-teal-darkest: #0a3538;
$cl-teal-darker: #104d51;
$cl-teal-dark: #239ea4;
$cl-teal: #52d4db;
$cl-teal-light: #74e6ec;
$cl-teal-lighter: #c8f5f5;
$cl-teal-lightest: #effdfd;

$cl-blue-darkest: #003457;
$cl-blue-darker: #004c80;
$cl-blue-dark: #005c99;
$cl-blue: #0077c7;
$cl-blue-light: #0098f0;
$cl-blue-lighter: #b6e4ff;
$cl-blue-lightest: #f2f9fd;

$cl-purple-darkest: #23174a;
$cl-purple-darker: #32246a;
$cl-purple-dark: #513caf;
$cl-purple: #6e56dc;
$cl-purple-light: #9881fd;
$cl-purple-lighter: #dad2ff;
$cl-purple-lightest: #f5f3ff;

$cl-red-darkest: #520a00;
$cl-red-darker: #9e1b10;
$cl-red-dark: #c1281a;
$cl-red: #e23b2c;
$cl-red-light: #ff5b4d;
$cl-red-lighter: #ffdcd8;
$cl-red-lightest: #fff7f5;

$cl-orange-darkest: #701e00;
$cl-orange-darker: #c03e07;
$cl-orange-dark: #eb6d00;
$cl-orange: #fd9c04;
$cl-orange-light: #ffb742;
$cl-orange-lighter: #ffe3af;
$cl-orange-lightest: #fef7ec;

$cl-yellow-darkest: $cl-orange-dark;
$cl-yellow-darker: $cl-orange;
$cl-yellow-dark: $cl-orange-light;
$cl-yellow: #ffde01;
$cl-yellow-light: #ffef50;
$cl-yellow-lighter: #fff8ae;
$cl-yellow-lightest: #fffceb;

$cl-green-darkest: #004732;
$cl-green-darker: #00845e;
$cl-green-dark: #00a879;
$cl-green: #01d296;
$cl-green-light: #76f6d2;
$cl-green-lighter: #d1fff2;
$cl-green-lightest: #edfffa;

$brand-primary: $cl-teal;
$brand-warning: #ffb433;

$border-radius: 6px;

input {
  &:focus {
    border-color: $cl-teal-light;
    box-shadow: 0 0 0 0.2rem rgba($cl-teal-lightest, 0.25);
  }
}

a:not(.btn) {
  color: $cl-teal;
  &:hover {
    color: $cl-teal-lighter;
  }
}

.text-muted {
  color: $gray-lighter !important;
  font-size: 16px;
}

code {
  color: #fff;
  font-size: 28px;
  font-family: monospace;
}

.iframe-wrapper {
  position: relative;
  height: 100vh;
  width: 100vw;
  iframe {
    transition: height 18s linear;
    position: absolute;
    width: 100%;
    height: 0%;
    top: 0;
    left: 0;
    right: 0;
  }
  &.reveal {
    iframe {
      height: 100%;
    }
  }
}

.glitch {
  color: white;
  font-size: 100px;
  position: relative;
  width: 400px;
  margin: 0 auto;
}
@keyframes noise-anim {
  $steps: 20;
  @for $i from 0 through $steps {
    #{percentage($i*(1/$steps))} {
      clip: rect(random(100) + px, 9999px, random(100) + px, 0);
    }
  }
}
.glitch:after {
  content: attr(data-text);
  position: absolute;
  left: 2px;
  text-shadow: -1px 0 red;
  top: 0;
  color: white;
  background: #333;
  overflow: hidden;
  clip: rect(0, 900px, 0, 0);
  animation: noise-anim 2s infinite linear alternate-reverse;
}

@keyframes noise-anim-2 {
  $steps: 20;
  @for $i from 0 through $steps {
    #{percentage($i*(1/$steps))} {
      clip: rect(random(100) + px, 9999px, random(100) + px, 0);
    }
  }
}
.glitch:before {
  content: attr(data-text);
  position: absolute;
  left: -2px;
  text-shadow: 1px 0 blue;
  top: 0;
  color: white;
  background: #333;
  overflow: hidden;
  clip: rect(0, 900px, 0, 0);
  animation: noise-anim-2 20s infinite linear alternate-reverse;
}
</style>
