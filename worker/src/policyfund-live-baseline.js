var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker.js
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var BASE = "https://policyfundpedia.com";
var CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};
var CAT_PAGES = {
  "\uC804\uCCB4-\uC815\uCC45\uC790\uAE08": { cat: null, title: "\uC815\uCC45\uC790\uAE08 \uC804\uCCB4 \uBAA9\uB85D 2026", desc: "\uC18C\uC0C1\uACF5\uC778\xB7\uCC3D\uC5C5\xB7\uC911\uC18C\uAE30\uC5C5\xB7\uACE0\uC6A9\xB7\uC11C\uBBFC\uAE08\uC735 \uB4F1 \uC815\uBD80 \uC815\uCC45\uC790\uAE08 \uC804\uCCB4 \uBAA9\uB85D\uC785\uB2C8\uB2E4.", h1: "\uC815\uBD80 \uC815\uCC45\uC790\uAE08 \uC804\uCCB4 \uBAA9\uB85D", keywords: "\uC815\uCC45\uC790\uAE08,\uC815\uBD80\uC9C0\uC6D0\uAE08,\uC18C\uC0C1\uACF5\uC778 \uB300\uCD9C,\uCC3D\uC5C5\uC790\uAE08,\uC911\uC18C\uAE30\uC5C5 \uB300\uCD9C", intro: "\uC18C\uC0C1\uACF5\uC778, \uC608\uBE44\uCC3D\uC5C5\uC790, \uC911\uC18C\uAE30\uC5C5, \uACE0\uC6A9\uC8FC, \uBE44\uC0AC\uC5C5\uC790\uB97C \uC704\uD55C \uC815\uBD80 \uC815\uCC45\uC790\uAE08 \uC804\uCCB4 \uBAA9\uB85D\uC785\uB2C8\uB2E4.", faq: [] },
  "\uC18C\uC0C1\uACF5\uC778-\uC815\uCC45\uC790\uAE08": {
    cat: "\uC18C\uC0C1\uACF5\uC778",
    title: "\uC18C\uC0C1\uACF5\uC778 \uC815\uCC45\uC790\uAE08 \uC885\uB958 \uCD1D\uC815\uB9AC 2026",
    desc: "\uC18C\uC0C1\uACF5\uC778\uC744 \uC704\uD55C \uC815\uBD80 \uC815\uCC45\uC790\uAE08 \uC815\uBCF4. \uC77C\uBC18\uACBD\uC601\uC548\uC815\uC790\uAE08, \uC2DC\uC124\uAC1C\uC120\uC790\uAE08, \uCCAD\uB144\xB7\uC5EC\uC131\xB7\uC7A5\uC560\uC778 \uC6B0\uB300\uC790\uAE08 \uB4F1 \uC885\uB958\uBCC4 \uD55C\uB3C4\xB7\uAE08\uB9AC\xB7\uC2E0\uCCAD\uBC29\uBC95\uC744 \uD655\uC778\uD558\uC138\uC694.",
    h1: "\uC18C\uC0C1\uACF5\uC778 \uC815\uCC45\uC790\uAE08 \uC885\uB958 \uBC0F \uC2E0\uCCAD \uBC29\uBC95",
    keywords: "\uC18C\uC0C1\uACF5\uC778 \uC815\uCC45\uC790\uAE08,\uC18C\uC0C1\uACF5\uC778 \uB300\uCD9C,\uC18C\uC9C4\uACF5 \uB300\uCD9C,\uC18C\uC0C1\uACF5\uC778\uC2DC\uC7A5\uC9C4\uD765\uACF5\uB2E8,\uC18C\uC0C1\uACF5\uC778 \uC9C0\uC6D0\uAE08,\uACBD\uC601\uC548\uC815\uC790\uAE08,\uC18C\uC0C1\uACF5\uC778 \uC800\uAE08\uB9AC \uB300\uCD9C",
    intro: "\uC18C\uC0C1\uACF5\uC778\uC2DC\uC7A5\uC9C4\uD765\uACF5\uB2E8(\uC18C\uC9C4\uACF5)\uC774 \uC6B4\uC601\uD558\uB294 \uC18C\uC0C1\uACF5\uC778 \uC815\uCC45\uC790\uAE08\uC740 \uB2F4\uBCF4 \uC5C6\uC774 \uC2E0\uCCAD \uAC00\uB2A5\uD55C \uC800\uAE08\uB9AC \uC815\uCC45 \uC735\uC790\uC785\uB2C8\uB2E4. \uC77C\uBC18\uACBD\uC601\uC548\uC815\uC790\uAE08, \uC2DC\uC124\uAC1C\uC120\uC790\uAE08, \uCCAD\uB144\xB7\uC5EC\uC131\xB7\uC7A5\uC560\uC778 \uC6B0\uB300 \uC790\uAE08 \uB4F1 \uB2E4\uC591\uD55C \uC885\uB958\uAC00 \uC788\uC73C\uBA70 \uCD5C\uB300 1\uC5B5\uC6D0\uAE4C\uC9C0 \uC5F0 2~3%\uB300 \uAE08\uB9AC\uB85C \uC9C0\uC6D0\uB429\uB2C8\uB2E4.",
    faq: [
      ["\uC18C\uC0C1\uACF5\uC778 \uC815\uCC45\uC790\uAE08 \uC2E0\uCCAD \uC790\uACA9\uC740?", "\uC0AC\uC5C5\uC790\uB4F1\uB85D\uC99D\uC744 \uBCF4\uC720\uD55C \uC18C\uC0C1\uACF5\uC778\uC774\uBA74 \uC2E0\uCCAD \uAC00\uB2A5\uD569\uB2C8\uB2E4. \uC0C1\uC2DC\uADFC\uB85C\uC790 5\uC778 \uBBF8\uB9CC(\uC81C\uC870\xB7\uAC74\uC124\xB7\uC6B4\uC218\uC5C5\uC740 10\uC778 \uBBF8\uB9CC)\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4."],
      ["\uC18C\uC0C1\uACF5\uC778 \uC815\uCC45\uC790\uAE08 \uAE08\uB9AC\uB294 \uC5BC\uB9C8\uC778\uAC00\uC694?", "\uBD84\uAE30\uBCC4\uB85C \uBCC0\uB3D9\uB418\uBA70 \uC77C\uBC18\uC801\uC73C\uB85C \uC5F0 2.5~3.5% \uC218\uC900\uC785\uB2C8\uB2E4. \uCCAD\uB144\xB7\uC5EC\uC131\xB7\uC7A5\uC560\uC778 \uB4F1 \uD2B9\uBCC4\uC790\uAE08\uC740 \uC6B0\uB300 \uAE08\uB9AC\uAC00 \uC801\uC6A9\uB429\uB2C8\uB2E4."],
      ["\uC18C\uC0C1\uACF5\uC778 \uC815\uCC45\uC790\uAE08 \uC5B4\uB514\uC11C \uC2E0\uCCAD\uD558\uB098\uC694?", "\uC18C\uC0C1\uACF5\uC778\uC2DC\uC7A5\uC9C4\uD765\uACF5\uB2E8 \uD648\uD398\uC774\uC9C0(semas.or.kr) \uC628\uB77C\uC778 \uC2E0\uCCAD \uB610\uB294 \uC804\uAD6D \uC18C\uC9C4\uACF5 \uC9C0\uC5ED\uC13C\uD130 \uBC29\uBB38 \uC2E0\uCCAD\uC774 \uAC00\uB2A5\uD569\uB2C8\uB2E4."]
    ]
  },
  "\uCC3D\uC5C5\uC9C0\uC6D0\uAE08-\uC885\uB958": {
    cat: "\uCC3D\uC5C5",
    title: "\uCC3D\uC5C5\uC9C0\uC6D0\uAE08 \uC885\uB958 \uBC0F \uC2E0\uCCAD\uBC29\uBC95 \uCD1D\uC815\uB9AC 2026",
    desc: "\uC608\uBE44\uCC3D\uC5C5\uC790\xB7\uCD08\uAE30\uCC3D\uC5C5\uC790\uB97C \uC704\uD55C \uC815\uBD80 \uCC3D\uC5C5\uC9C0\uC6D0\uAE08 \uC815\uBCF4. \uC608\uBE44\uCC3D\uC5C5\uD328\uD0A4\uC9C0, \uCCAD\uB144\uCC3D\uC5C5\uC0AC\uAD00\uD559\uAD50, \uCC3D\uC5C5\uB3C4\uC57D\uD328\uD0A4\uC9C0 \uB4F1 \uC885\uB958\uBCC4 \uC9C0\uC6D0\uAE08\uC561\xB7\uC790\uACA9\xB7\uC2E0\uCCAD\uBC29\uBC95 \uC548\uB0B4.",
    h1: "\uCC3D\uC5C5\uC9C0\uC6D0\uAE08 \uC885\uB958 \uBC0F \uC2E0\uCCAD \uC790\uACA9 \uCD1D\uC815\uB9AC",
    keywords: "\uCC3D\uC5C5\uC9C0\uC6D0\uAE08,\uC608\uBE44\uCC3D\uC5C5\uD328\uD0A4\uC9C0,\uCCAD\uB144\uCC3D\uC5C5\uC0AC\uAD00\uD559\uAD50,\uCC3D\uC5C5\uB3C4\uC57D\uD328\uD0A4\uC9C0,K\uC2A4\uD0C0\uD2B8\uC5C5,\uCC3D\uC5C5 \uC815\uBD80\uC9C0\uC6D0,\uCC3D\uC5C5 \uBCF4\uC870\uAE08",
    intro: "K-\uC2A4\uD0C0\uD2B8\uC5C5\uACFC \uCC3D\uC5C5\uC9C4\uD765\uC6D0\uC774 \uC6B4\uC601\uD558\uB294 \uCC3D\uC5C5\uC9C0\uC6D0\uAE08\uC740 \uC608\uBE44\uCC3D\uC5C5\uC790\uBD80\uD130 \uCC3D\uC5C5 7\uB144 \uC774\uB0B4 \uAE30\uC5C5\uAE4C\uC9C0 \uB2E8\uACC4\uBCC4\uB85C \uC9C0\uC6D0\uD569\uB2C8\uB2E4. \uC0C1\uD658 \uC758\uBB34 \uC5C6\uB294 \uC0AC\uC5C5\uD654 \uC790\uAE08\uC73C\uB85C \uCD5C\uB300 1\uC5B5\uC6D0 \uC774\uC0C1\uC744 \uC9C0\uC6D0\uBC1B\uC744 \uC218 \uC788\uC73C\uBA70 \uB9E4\uB144 \uC0C1\xB7\uD558\uBC18\uAE30\uC5D0 \uBAA8\uC9D1\uD569\uB2C8\uB2E4.",
    faq: [
      ["\uCC3D\uC5C5\uC9C0\uC6D0\uAE08\uC740 \uC0C1\uD658\uD574\uC57C \uD558\uB098\uC694?", "\uB300\uBD80\uBD84\uC758 \uCC3D\uC5C5\uC9C0\uC6D0\uAE08(\uC0AC\uC5C5\uD654 \uC790\uAE08)\uC740 \uC9C0\uC6D0\uAE08 \uD615\uD0DC\uB85C \uC0C1\uD658 \uC758\uBB34\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. \uB2E8, \uCC3D\uC5C5\uAE30\uC5C5 \uC804\uC6A9\uC790\uAE08 \uB4F1 \uC735\uC790\uD615\uC740 \uC0C1\uD658\uC774 \uD544\uC694\uD569\uB2C8\uB2E4."],
      ["\uC608\uBE44\uCC3D\uC5C5\uC790\uB3C4 \uCC3D\uC5C5\uC9C0\uC6D0\uAE08\uC744 \uBC1B\uC744 \uC218 \uC788\uB098\uC694?", "\uB124. \uC608\uBE44\uCC3D\uC5C5\uD328\uD0A4\uC9C0, \uCCAD\uB144\uCC3D\uC5C5\uC0AC\uAD00\uD559\uAD50 \uB4F1\uC740 \uC0AC\uC5C5\uC790\uB4F1\uB85D \uC804 \uC608\uBE44\uCC3D\uC5C5\uC790\uB3C4 \uC2E0\uCCAD \uAC00\uB2A5\uD569\uB2C8\uB2E4."],
      ["\uCC3D\uC5C5\uC9C0\uC6D0\uAE08 \uC5B4\uB514\uC11C \uC2E0\uCCAD\uD558\uB098\uC694?", "K-\uC2A4\uD0C0\uD2B8\uC5C5(k-startup.go.kr)\uC5D0\uC11C \uACF5\uACE0\uB97C \uD655\uC778\uD558\uACE0 \uC628\uB77C\uC778\uC73C\uB85C \uC2E0\uCCAD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."]
    ]
  },
  "\uC911\uC18C\uAE30\uC5C5-\uC815\uCC45\uC790\uAE08": {
    cat: "\uC911\uC18C\uAE30\uC5C5",
    title: "\uC911\uC18C\uAE30\uC5C5 \uC815\uCC45\uC790\uAE08 \uBC0F \uBCF4\uC99D \uC9C0\uC6D0 \uCD1D\uC815\uB9AC 2026",
    desc: "\uC911\uC18C\uAE30\uC5C5\uC744 \uC704\uD55C \uC815\uBD80 \uC815\uCC45\uC790\uAE08 \uC815\uBCF4. \uC911\uC9C4\uACF5 \uC6B4\uC804\uC790\uAE08, \uC2DC\uC124\uC790\uAE08, \uAE30\uBCF4 \uAE30\uC220\uBCF4\uC99D, IP\uB2F4\uBCF4\uB300\uCD9C \uB4F1 \uC885\uB958\uBCC4 \uD55C\uB3C4\xB7\uAE08\uB9AC\xB7\uC2E0\uCCAD\uBC29\uBC95\uC744 \uD655\uC778\uD558\uC138\uC694.",
    h1: "\uC911\uC18C\uAE30\uC5C5 \uC815\uCC45\uC790\uAE08 \uC885\uB958 \uBC0F \uC2E0\uCCAD \uBC29\uBC95",
    keywords: "\uC911\uC18C\uAE30\uC5C5 \uC815\uCC45\uC790\uAE08,\uC911\uC9C4\uACF5 \uB300\uCD9C,\uAE30\uC220\uBCF4\uC99D\uAE30\uAE08,\uAE30\uBCF4 \uBCF4\uC99D,\uC911\uC18C\uAE30\uC5C5 \uC9C0\uC6D0,IP\uB2F4\uBCF4\uB300\uCD9C,\uC911\uC18C\uAE30\uC5C5 \uC800\uAE08\uB9AC \uB300\uCD9C",
    intro: "\uC911\uC18C\uBCA4\uCC98\uAE30\uC5C5\uC9C4\uD765\uACF5\uB2E8(\uC911\uC9C4\uACF5)\uACFC \uAE30\uC220\uBCF4\uC99D\uAE30\uAE08(\uAE30\uBCF4)\uC774 \uC6B4\uC601\uD558\uB294 \uC911\uC18C\uAE30\uC5C5 \uC815\uCC45\uC790\uAE08\uC740 \uC6B4\uC804\uC790\uAE08, \uC2DC\uC124\uC790\uAE08, R&D \uC790\uAE08, IP\uB2F4\uBCF4 \uB300\uCD9C \uB4F1 \uB2E4\uC591\uD55C \uD615\uD0DC\uB85C \uC9C0\uC6D0\uB429\uB2C8\uB2E4. \uCD5C\uB300 30\uC5B5\uC6D0\uAE4C\uC9C0 \uC5F0 2~3%\uB300 \uC7A5\uAE30 \uC800\uAE08\uB9AC\uB85C \uC774\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    faq: [
      ["\uC911\uC18C\uAE30\uC5C5 \uC815\uCC45\uC790\uAE08 \uC2E0\uCCAD \uC790\uACA9\uC740?", "\uC911\uC18C\uAE30\uC5C5\uAE30\uBCF8\uBC95\uC0C1 \uC911\uC18C\uAE30\uC5C5\uC774\uBA74 \uC2E0\uCCAD \uAC00\uB2A5\uD569\uB2C8\uB2E4. \uC5C5\uB825, \uB9E4\uCD9C\uC561, \uC885\uC5C5\uC6D0 \uC218 \uB4F1\uC5D0 \uB530\uB77C \uC9C0\uC6D0 \uC790\uAE08 \uC885\uB958\uAC00 \uB2EC\uB77C\uC9D1\uB2C8\uB2E4."],
      ["\uB2F4\uBCF4 \uC5C6\uC774 \uC911\uC18C\uAE30\uC5C5 \uB300\uCD9C\uC744 \uBC1B\uC744 \uC218 \uC788\uB098\uC694?", "\uB124. \uAE30\uC220\uBCF4\uC99D\uAE30\uAE08(\uAE30\uBCF4)\uC774\uB098 \uC2E0\uC6A9\uBCF4\uC99D\uAE30\uAE08(\uC2E0\uBCF4)\uC5D0\uC11C \uAE30\uC220\uB825\xB7\uC2E0\uC6A9\uC744 \uD3C9\uAC00\uD574 \uBCF4\uC99D\uC11C\uB97C \uBC1C\uAE09\uBC1B\uC73C\uBA74 \uB2F4\uBCF4 \uC5C6\uC774 \uAE08\uC735\uAE30\uAD00 \uB300\uCD9C\uC774 \uAC00\uB2A5\uD569\uB2C8\uB2E4."],
      ["\uC911\uC18C\uAE30\uC5C5 \uC815\uCC45\uC790\uAE08 \uC5B4\uB514\uC11C \uC2E0\uCCAD\uD558\uB098\uC694?", "\uC911\uC18C\uBCA4\uCC98\uAE30\uC5C5\uC9C4\uD765\uACF5\uB2E8(sbc.or.kr) \uD648\uD398\uC774\uC9C0 \uB610\uB294 \uC9C0\uC5ED\uBCF8\uBD80\uB97C \uBC29\uBB38\uD574 \uC2E0\uCCAD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."]
    ]
  },
  "\uACE0\uC6A9\uC9C0\uC6D0\uAE08-\uC2E0\uCCAD\uBC29\uBC95": {
    cat: "\uACE0\uC6A9",
    title: "\uACE0\uC6A9\uC9C0\uC6D0\uAE08 \uC885\uB958 \uBC0F \uC2E0\uCCAD\uBC29\uBC95 \uC644\uBCBD \uAC00\uC774\uB4DC 2026",
    desc: "\uC0AC\uC5C5\uC8FC\uC640 \uADFC\uB85C\uC790\uB97C \uC704\uD55C \uACE0\uC6A9\uC9C0\uC6D0\uAE08 \uC815\uBCF4. \uCCAD\uB144\uC77C\uC790\uB9AC\uB3C4\uC57D\uC7A5\uB824\uAE08, \uACE0\uC6A9\uC720\uC9C0\uC9C0\uC6D0\uAE08, \uC721\uC544\uD734\uC9C1 \uC9C0\uC6D0\uAE08 \uB4F1 \uC885\uB958\uBCC4 \uC9C0\uC6D0\uAE08\uC561\xB7\uC790\uACA9\xB7\uC2E0\uCCAD\uBC29\uBC95 \uC548\uB0B4.",
    h1: "\uACE0\uC6A9\uC9C0\uC6D0\uAE08 \uC885\uB958\uBCC4 \uC2E0\uCCAD \uBC29\uBC95 \uC644\uBCBD \uAC00\uC774\uB4DC",
    keywords: "\uACE0\uC6A9\uC9C0\uC6D0\uAE08,\uCCAD\uB144\uC77C\uC790\uB9AC\uB3C4\uC57D\uC7A5\uB824\uAE08,\uACE0\uC6A9\uC720\uC9C0\uC9C0\uC6D0\uAE08,\uC721\uC544\uD734\uC9C1\uC9C0\uC6D0\uAE08,\uACE0\uC6A924,\uC0AC\uC5C5\uC8FC \uC9C0\uC6D0\uAE08,\uACE0\uC6A9 \uBCF4\uC870\uAE08",
    intro: "\uACE0\uC6A9\uB178\uB3D9\uBD80\uC640 \uACE0\uC6A924\uC5D0\uC11C \uC6B4\uC601\uD558\uB294 \uACE0\uC6A9\uC9C0\uC6D0\uAE08\uC740 \uC9C1\uC6D0\uC744 \uCC44\uC6A9\uD558\uAC70\uB098 \uACE0\uC6A9\uC744 \uC720\uC9C0\uD558\uB294 \uC0AC\uC5C5\uC8FC\uC5D0\uAC8C \uC778\uAC74\uBE44 \uC77C\uBD80\uB97C \uC9C0\uC6D0\uD558\uB294 \uC81C\uB3C4\uC785\uB2C8\uB2E4. \uCCAD\uB144\uC77C\uC790\uB9AC\uB3C4\uC57D\uC7A5\uB824\uAE08, \uACE0\uC6A9\uC720\uC9C0\uC9C0\uC6D0\uAE08, \uC721\uC544\uD734\uC9C1 \uC9C0\uC6D0\uAE08 \uB4F1 \uB2E4\uC591\uD55C \uC885\uB958\uAC00 \uC788\uC73C\uBA70 \uACE0\uC6A924\uC5D0\uC11C \uC2E0\uCCAD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    faq: [
      ["\uACE0\uC6A9\uC9C0\uC6D0\uAE08 \uC2E0\uCCAD \uC790\uACA9\uC740?", "\uACE0\uC6A9\uBCF4\uD5D8\uC5D0 \uAC00\uC785\uB41C \uC0AC\uC5C5\uC7A5\uC774\uBA74 \uB300\uBD80\uBD84 \uC2E0\uCCAD \uAC00\uB2A5\uD569\uB2C8\uB2E4. \uC9C0\uC6D0\uAE08 \uC885\uB958\uBCC4\uB85C \uC0AC\uC5C5\uC7A5 \uADDC\uBAA8, \uACE0\uC6A9 \uD615\uD0DC \uB4F1 \uC138\uBD80 \uC694\uAC74\uC774 \uB2E4\uB985\uB2C8\uB2E4."],
      ["\uACE0\uC6A9\uC9C0\uC6D0\uAE08\uC740 \uC5BC\uB9C8\uB098 \uBC1B\uC744 \uC218 \uC788\uB098\uC694?", "\uCCAD\uB144\uC77C\uC790\uB9AC\uB3C4\uC57D\uC7A5\uB824\uAE08\uC758 \uACBD\uC6B0 \uC6D4 \uCD5C\uB300 80\uB9CC\uC6D0 \xD7 \uCD5C\uB300 24\uAC1C\uC6D4\uC744 \uC9C0\uC6D0\uBC1B\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4."],
      ["\uACE0\uC6A9\uC9C0\uC6D0\uAE08 \uC5B4\uB514\uC11C \uC2E0\uCCAD\uD558\uB098\uC694?", "\uACE0\uC6A924(work24.go.kr)\uC5D0\uC11C \uC628\uB77C\uC778\uC73C\uB85C \uC2E0\uCCAD\uD558\uAC70\uB098 \uAC00\uAE4C\uC6B4 \uACE0\uC6A9\uB178\uB3D9\uBD80 \uACE0\uC6A9\uC13C\uD130\uB97C \uBC29\uBB38\uD574 \uC2E0\uCCAD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."]
    ]
  },
  "\uBE44\uC0AC\uC5C5\uC790-\uC11C\uBBFC\uAE08\uC735": {
    cat: "\uBE44\uC0AC\uC5C5\uC790",
    title: "\uBE44\uC0AC\uC5C5\uC790 \uC11C\uBBFC\uAE08\uC735 \uB300\uCD9C \uC885\uB958 \uCD1D\uC815\uB9AC 2026",
    desc: "\uC0AC\uC5C5\uC790\uB4F1\uB85D\uC774 \uC5C6\uB294 \uAC1C\uC778\uC744 \uC704\uD55C \uC11C\uBBFC\uAE08\uC735 \uB300\uCD9C \uC815\uBCF4. \uD587\uC0B4\uB860, \uCCAD\uB144 \uD587\uC0B4\uB860, \uBC14\uAFD4\uB4DC\uB9BC\uB860, \uC18C\uC561\uC0DD\uACC4\uBE44 \uB300\uCD9C \uB4F1 \uC885\uB958\uBCC4 \uD55C\uB3C4\xB7\uAE08\uB9AC\xB7\uC2E0\uCCAD\uBC29\uBC95 \uC548\uB0B4.",
    h1: "\uBE44\uC0AC\uC5C5\uC790 \uC11C\uBBFC\uAE08\uC735 \uB300\uCD9C \uC885\uB958 \uBC0F \uC2E0\uCCAD \uBC29\uBC95",
    keywords: "\uC11C\uBBFC\uAE08\uC735,\uD587\uC0B4\uB860,\uBC14\uAFD4\uB4DC\uB9BC\uB860,\uC18C\uC561\uC0DD\uACC4\uBE44\uB300\uCD9C,\uBE44\uC0AC\uC5C5\uC790 \uB300\uCD9C,\uC800\uC2E0\uC6A9 \uB300\uCD9C,\uCCAD\uB144\uD587\uC0B4\uB860,\uC11C\uBBFC\uAE08\uC735\uC9C4\uD765\uC6D0",
    intro: "\uC11C\uBBFC\uAE08\uC735\uC9C4\uD765\uC6D0\uC774 \uC6B4\uC601\uD558\uB294 \uC11C\uBBFC\uAE08\uC735 \uB300\uCD9C \uC0C1\uD488\uC740 \uC800\uC2E0\uC6A9\xB7\uC800\uC18C\uB4DD\uC73C\uB85C \uC77C\uBC18 \uAE08\uC735\uAE30\uAD00 \uC774\uC6A9\uC774 \uC5B4\uB824\uC6B4 \uAC1C\uC778\uC744 \uC704\uD55C \uC815\uCC45 \uB300\uCD9C\uC785\uB2C8\uB2E4. \uD587\uC0B4\uB860, \uCCAD\uB144 \uD587\uC0B4\uB860, \uBC14\uAFD4\uB4DC\uB9BC\uB860, \uC18C\uC561\uC0DD\uACC4\uBE44 \uB300\uCD9C \uB4F1 \uB2E4\uC591\uD55C \uC0C1\uD488\uC774 \uC788\uC73C\uBA70 \uC11C\uBBFC\uAE08\uC735\uD1B5\uD569\uC9C0\uC6D0\uC13C\uD130(1397)\uC5D0\uC11C \uC0C1\uB2F4\uBC1B\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    faq: [
      ["\uBE44\uC0AC\uC5C5\uC790\uB3C4 \uC815\uBD80 \uB300\uCD9C\uC744 \uBC1B\uC744 \uC218 \uC788\uB098\uC694?", "\uB124. \uC11C\uBBFC\uAE08\uC735\uC9C4\uD765\uC6D0\uC758 \uD587\uC0B4\uB860, \uCCAD\uB144 \uD587\uC0B4\uB860, \uC18C\uC561\uC0DD\uACC4\uBE44 \uB300\uCD9C \uB4F1\uC740 \uC0AC\uC5C5\uC790\uB4F1\uB85D \uC5C6\uC774\uB3C4 \uC2E0\uCCAD \uAC00\uB2A5\uD569\uB2C8\uB2E4."],
      ["\uC2E0\uC6A9\uC810\uC218\uAC00 \uB0AE\uC544\uB3C4 \uC11C\uBBFC\uAE08\uC735 \uB300\uCD9C\uC744 \uBC1B\uC744 \uC218 \uC788\uB098\uC694?", "\uC2E0\uC6A9\uC810\uC218 \uD558\uC704 20% \uC774\uD558\uC774\uAC70\uB098 \uAE30\uCD08\uC0DD\uD65C\uC218\uAE09\uC790\uB77C\uBA74 \uBBF8\uC18C\uAE08\uC735, \uC18C\uC561\uC0DD\uACC4\uBE44 \uB300\uCD9C \uB4F1\uC744 \uC774\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."],
      ["\uC11C\uBBFC\uAE08\uC735 \uB300\uCD9C \uC5B4\uB514\uC11C \uC2E0\uCCAD\uD558\uB098\uC694?", "\uC11C\uBBFC\uAE08\uC735\uC9C4\uD765\uC6D0(kinfa.or.kr) \uD648\uD398\uC774\uC9C0, \uC11C\uBBFC\uAE08\uC735\uD1B5\uD569\uC9C0\uC6D0\uC13C\uD130(1397) \uC804\uD654 \uC0C1\uB2F4, \uB610\uB294 \uB18D\uD611\xB7\uC2E0\uD611 \uB4F1 \uC81C\uD734 \uAE08\uC735\uAE30\uAD00\uC5D0\uC11C \uC2E0\uCCAD \uAC00\uB2A5\uD569\uB2C8\uB2E4."]
    ]
  }
};
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = decodeURIComponent(url.pathname).replace(/\/$/, "") || "/";
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (path.startsWith("/api/search")) return handleSearch(url, env);
    if (path.startsWith("/api/funds")) return handleFunds(url, path, env);
    if (path.startsWith("/api/stats")) return handleStats(env);
    const legacyRedirects = {
      "/\uC804\uCCB4-\uC815\uCC45\uC790\uAE08": "/",
      "/\uCC3D\uC5C5\uC9C0\uC6D0\uAE08-\uC885\uB958": "/\uCC3D\uC5C5\uC9C0\uC6D0\uAE08/",
      "/\uACE0\uC6A9\uC9C0\uC6D0\uAE08-\uC2E0\uCCAD\uBC29\uBC95": "/\uACE0\uC6A9\uC9C0\uC6D0\uAE08/",
      "/\uBE44\uC0AC\uC5C5\uC790-\uC11C\uBBFC\uAE08\uC735": "/\uC11C\uBBFC\uAE08\uC735-\uB300\uCD9C/"
    };
    if (legacyRedirects[path]) return Response.redirect(`${BASE}${legacyRedirects[path]}`, 301);
    const fundsMatch = path.match(/^\/funds\/(\d+)$/);
    if (fundsMatch) {
      const row = await env.DB.prepare("SELECT slug FROM funds WHERE id=?").bind(parseInt(fundsMatch[1])).first();
      if (row?.slug) return Response.redirect(`${BASE}/${row.slug}/`, 301);
    }
    const assetResponse = await fetch(request);
    if (assetResponse.status !== 404) return assetResponse;
    const slug = path.replace(/^\//, "");
    if (CAT_PAGES[slug]) return handleCatPage(slug, env, url);
    if (slug && !slug.includes("/")) {
      const row = await env.DB.prepare("SELECT * FROM funds WHERE slug=?").bind(slug).first();
      if (row) return handleDetailPage(parseRow(row), env);
      const regionRow = await env.DB.prepare("SELECT * FROM region_pages WHERE slug=?").bind(slug).first();
      if (regionRow) return handleRegionPage(regionRow, env);
    }
    return assetResponse;
  }
};
async function handleCatPage(slug, env, url) {
  const meta = CAT_PAGES[slug];
  const q = (url.searchParams?.get("q") || "").trim();
  const like = "%" + q + "%";
  const funds = q ? meta.cat ? await env.DB.prepare("SELECT * FROM funds WHERE cat=? AND (title LIKE ? OR excerpt LIKE ?) ORDER BY id").bind(meta.cat, like, like).all() : await env.DB.prepare("SELECT * FROM funds WHERE (title LIKE ? OR excerpt LIKE ?) ORDER BY id").bind(like, like).all() : meta.cat ? await env.DB.prepare("SELECT * FROM funds WHERE cat=? ORDER BY id").bind(meta.cat).all() : await env.DB.prepare("SELECT * FROM funds ORDER BY id").all();
  const regionRows = q && !meta.cat ? (await env.DB.prepare("SELECT slug,region,type_name,title,description FROM region_pages WHERE (region LIKE ? OR title LIKE ? OR type_name LIKE ?) ORDER BY region,type LIMIT 20").bind(like, like, like).all()).results || [] : [];
  const items = (funds.results || []).map(parseRow);
  const faqSchema = meta.faq.map(
    ([q2, a]) => `{"@type":"Question","name":"${esc(q2)}","acceptedAnswer":{"@type":"Answer","text":"${esc(a)}"}}`
  ).join(",");
  const faqHtml = meta.faq.map(
    ([q2, a]) => `<div class="faq-item"><div class="faq-q">Q. ${q2}</div><div class="faq-a">A. ${a}</div></div>`
  ).join("");
  const cardsHtml = items.map(
    (f) => `<a href="/${f.slug}/" class="fcard-link">
      <div class="fcard">
        <div class="fc-tags">${(f.tags || []).map((t) => `<span class="tag ${t.c}">${t.t}</span>`).join("")}<span class="tag torg">${f.org}</span></div>
        <div class="fc-title">${f.title}</div>
        <div class="fc-desc">${f.excerpt}</div>
        <div class="fc-meta">
          <span class="fm">\uD55C\uB3C4 <b>${f.lim}</b></span>
          <span class="fm">\uAE08\uB9AC <b>${f.rate}</b></span>
          <span class="fm-more">\uC790\uC138\uD788 \uBCF4\uAE30 \u2192</span>
        </div>
      </div>
    </a>`
  ).join("");
  const otherLinks = Object.entries(CAT_PAGES).filter(([s]) => s !== slug).map(([s, m]) => `<a href="/${s}/" class="rel-link">${m.cat}</a>`).join("");
  return html(pageShell({
    title: `${meta.title} | \uC815\uCC45\uC790\uAE08 \uBC31\uACFC`,
    desc: meta.desc,
    keywords: meta.keywords,
    canonical: `${BASE}/${slug}/`,
    faqSchema,
    breadcrumb: [["\uD648", `${BASE}/`], [meta.cat, `${BASE}/${slug}/`]],
    body: `
      <div class="cat-hero">
        <div class="cat-badge">${meta.cat || "\uC804\uCCB4"} \uC815\uCC45\uC790\uAE08</div>
        <h1>${meta.h1}</h1>
        <p class="cat-intro">${meta.intro}</p>
      </div>
      <div class="fund-list">
        <div class="sec-head"><span class="sec-name">${q ? `"${esc(q)}" \uAC80\uC0C9 \uACB0\uACFC` : `${meta.cat || "\uC804\uCCB4"} \uC9C0\uC6D0 \uC815\uBCF4`}</span><span class="sec-cnt">${items.length}\uAC74</span></div>
        ${cardsHtml}
                ${regionRows.length ? `<div class="sec-head" style="margin-top:24px"><span class="sec-name">\uC9C0\uC5ED\uBCC4 \uC815\uCC45\uC790\uAE08</span><span class="sec-cnt">${regionRows.length}\uAC74</span></div>${regionRows.map((r) => `<a href="/${esc(r.slug)}/" class="fcard-link"><div class="fcard"><div class="fc-tags"><span class="tag tb">${esc(r.region)}</span><span class="tag tk">${esc(r.type_name)}</span></div><div class="fc-title">${esc(r.title)}</div><div class="fc-desc">${esc(r.description || "")}</div></div><span class="fcard-arr">\uC790\uC138\uD788 \uBCF4\uAE30 \u2192</span></a>`).join("")}` : ""}
      </div>
      <div class="faq-section"><h2>\uC790\uC8FC \uBB3B\uB294 \uC9C8\uBB38</h2>${faqHtml}</div>
      <div class="rel-cats">
        <div class="rel-title">\uB2E4\uB978 \uC815\uCC45\uC790\uAE08 \uC815\uBCF4</div>
        <div class="rel-links"><a href="/" class="rel-link">\uC804\uCCB4 \uBCF4\uAE30</a>${otherLinks}</div>
      </div>`
  }));
}
__name(handleCatPage, "handleCatPage");
__name2(handleCatPage, "handleCatPage");
async function handleDetailPage(f, env) {
  const catSlug = Object.entries(CAT_PAGES).find(([, m]) => m.cat === f.cat)?.[0] || "";
  const related = await env.DB.prepare(
    "SELECT id,title,org,tags,slug FROM funds WHERE cat=? AND id!=? LIMIT 4"
  ).bind(f.cat, f.id).all();
  const stepsHtml = (f.steps || []).map(
    (s, i) => `<div class="step-item"><span class="step-n">${i + 1}</span><span class="step-t">${s}</span></div>`
  ).join("");
  const relatedHtml = (related.results || []).map((r) => {
    const tags = tryParse(r.tags, []);
    return `<a href="/${r.slug}/" class="rel-card">
      <span class="tag ${tags[0]?.c || "tb"}">${tags[0]?.t || ""}</span>
      <span class="rel-card-title">${r.title}</span>
    </a>`;
  }).join("");
  const faqSchema = `{"@type":"Question","name":"${esc(f.title)} \uC2E0\uCCAD \uBC29\uBC95\uC740?","acceptedAnswer":{"@type":"Answer","text":"${esc(f.target_desc)}. \uD544\uC694\uC11C\uB958: ${esc(f.docs)}"}}`;
  return html(pageShell({
    title: `${f.title} | \uC815\uCC45\uC790\uAE08 \uBC31\uACFC`,
    desc: `${f.excerpt} \uC9C0\uC6D0 \uB300\uC0C1: ${f.target_desc}. \uD55C\uB3C4: ${f.lim}. \uAE08\uB9AC: ${f.rate}.`,
    keywords: `${f.title},${f.cat} \uC815\uCC45\uC790\uAE08,${f.org},${(f.tags || []).map((t) => t.t).join(",")}`,
    canonical: `${BASE}/${f.slug}/`,
    faqSchema,
    breadcrumb: [["\uD648", `${BASE}/`], [f.cat, `${BASE}/${catSlug}/`], [f.title.split("\u2014")[0].trim(), `${BASE}/${f.slug}/`]],
    body: `
      <div class="d-card">
        <div class="d-top">
          <div class="breadcrumb-nav">
            <a href="/">\uD648</a> \u203A <a href="/${catSlug}/">${f.cat}</a> \u203A <span>${f.title.split("\u2014")[0].trim()}</span>
          </div>
          <div class="d-tags">${(f.tags || []).map((t) => `<span class="tag ${t.c}">${t.t}</span>`).join("")}</div>
          <h1 class="d-title">${f.title}</h1>
          <p class="d-desc">${f.detail}</p>
        </div>
        <div class="d-summary">
          <div class="d-si"><div class="d-sl">\uC9C0\uC6D0 \uD55C\uB3C4</div><div class="d-sv">${f.lim}</div></div>
          <div class="d-si"><div class="d-sl">\uAE08\uB9AC / \uC9C0\uC6D0</div><div class="d-sv">${f.rate}</div></div>
          <div class="d-si"><div class="d-sl">\uB2F4\uB2F9 \uAE30\uAD00</div><div class="d-sv ink">${f.org}</div></div>
        </div>
        <div class="d-body">
          <div class="d-stitle">\uC9C0\uC6D0 \uB0B4\uC6A9</div>
          <div class="info-rows">
            <div class="info-row"><span class="info-k">\uC9C0\uC6D0 \uB300\uC0C1</span><span class="info-v">${f.target_desc}</span></div>
            <div class="info-row"><span class="info-k">\uC9C0\uC6D0 \uAE08\uC561</span><span class="info-v">${f.amount_desc}</span></div>
            <div class="info-row"><span class="info-k">\uAE08\uB9AC\xB7\uC9C0\uC6D0</span><span class="info-v">${f.rate_desc}</span></div>
            <div class="info-row"><span class="info-k">\uC9C0\uC6D0 \uAE30\uAC04</span><span class="info-v">${f.period_desc}</span></div>
            <div class="info-row"><span class="info-k">\uD544\uC694 \uC11C\uB958</span><span class="info-v">${f.docs}</span></div>
          </div>
          <div class="d-stitle">\uC2E0\uCCAD \uC808\uCC28</div>
          <div class="step-list">${stepsHtml}</div>
          <a class="official-btn" href="${f.agency}" target="_blank" rel="noopener">
            <div class="ob-text">
              <strong>${f.agency_name} \uACF5\uC2DD \uC0AC\uC774\uD2B8\uC5D0\uC11C \uC2E0\uCCAD\uD558\uAE30 \u2197</strong>
              <span>${f.agency_note}</span>
            </div>
          </a>
        </div>
        ${relatedHtml ? `<div class="related-sec"><div class="related-title">\uAC19\uC740 \uCE74\uD14C\uACE0\uB9AC \uB2E4\uB978 \uC815\uBCF4</div><div class="rel-cards">${relatedHtml}</div></div>` : ""}
      </div>`
  }));
}
__name(handleDetailPage, "handleDetailPage");
__name2(handleDetailPage, "handleDetailPage");
async function handleFunds(url, path, env) {
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 3) {
    const id = parseInt(parts[2]);
    if (isNaN(id)) return json({ error: "Invalid id" }, 400);
    const row = await env.DB.prepare("SELECT * FROM funds WHERE id=?").bind(id).first();
    if (!row) return json({ error: "Not found" }, 404);
    return json(parseRow(row));
  }
  const cat = url.searchParams.get("cat") || "";
  const limit = parseInt(url.searchParams.get("limit") || "100");
  let q = "SELECT * FROM funds";
  const params = [];
  if (cat) {
    q += " WHERE cat=?";
    params.push(cat);
  }
  q += " ORDER BY cat,id LIMIT ?";
  const rows = await env.DB.prepare(q).bind(...params, limit).all();
  const total = await env.DB.prepare(cat ? "SELECT COUNT(*) as cnt FROM funds WHERE cat=?" : "SELECT COUNT(*) as cnt FROM funds").bind(...cat ? [cat] : []).first();
  return json({ total: total?.cnt || 0, items: (rows.results || []).map(parseRow) });
}
__name(handleFunds, "handleFunds");
__name2(handleFunds, "handleFunds");
async function handleSearch(url, env) {
  const q = (url.searchParams.get("q") || "").trim();
  if (!q) return json({ items: [] });
  const like = `%${q}%`;
  const rows = await env.DB.prepare("SELECT * FROM funds WHERE title LIKE ? OR excerpt LIKE ? OR org LIKE ? OR cat LIKE ? OR detail LIKE ? LIMIT 30").bind(like, like, like, like, like).all();
  return json({ q, total: rows.results?.length || 0, items: (rows.results || []).map(parseRow) });
}
__name(handleSearch, "handleSearch");
__name2(handleSearch, "handleSearch");
async function handleStats(env) {
  const rows = await env.DB.prepare("SELECT cat,COUNT(*) as cnt FROM funds GROUP BY cat").all();
  const total = await env.DB.prepare("SELECT COUNT(*) as cnt FROM funds").first();
  return json({ total: total?.cnt || 0, cats: rows.results || [] });
}
__name(handleStats, "handleStats");
__name2(handleStats, "handleStats");
async function handleSitemap(env) {
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const funds = await env.DB.prepare("SELECT slug FROM funds WHERE slug IS NOT NULL ORDER BY id").all();
  const regions = await env.DB.prepare("SELECT slug FROM region_pages ORDER BY slug").all();
  const urls = [
    `<url><loc>${BASE}/</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`,
    ...Object.keys(CAT_PAGES).map((s) => `<url><loc>${BASE}/${s}/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`),
    ...(funds.results || []).map((f) => `<url><loc>${BASE}/${f.slug}/</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`),
    ...(regions.results || []).map((r) => `<url><loc>${BASE}/${r.slug}/</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`)
  ];
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`,
    { headers: { "Content-Type": "application/xml", ...CORS } }
  );
}
__name(handleSitemap, "handleSitemap");
__name2(handleSitemap, "handleSitemap");
function pageShell({ title, desc, keywords, canonical, faqSchema, breadcrumb, body }) {
  const bcSchema = breadcrumb.map(
    ([name, url], i) => `{"@type":"ListItem","position":${i + 1},"name":"${name}","item":"${url}"}`
  ).join(",");
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<meta name="theme-color" content="#0f172a">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="keywords" content="${keywords}">
<meta name="robots" content="index,follow">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="\uC815\uCC45\uC790\uAE08 \uBC31\uACFC">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="ko_KR">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[${faqSchema}]}<\/script>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[${bcSchema}]}<\/script>
<style>
@font-face{font-family:'A2z';src:url('https://cdn.jsdelivr.net/gh/projectnoonnu/2601-6@1.0/\uC5D0\uC774\uD22C\uC9C0\uCCB4-4Regular.woff2') format('woff2');font-weight:400;font-display:swap}
@font-face{font-family:'A2z';src:url('https://cdn.jsdelivr.net/gh/projectnoonnu/2601-6@1.0/\uC5D0\uC774\uD22C\uC9C0\uCCB4-7Bold.woff2') format('woff2');font-weight:700;font-display:swap}
:root{--ink:#0f172a;--ink2:#334155;--ink3:#64748b;--ink4:#94a3b8;--sur:#f8f7f5;--sur2:#f1efe9;--white:#fff;--line:rgba(15,23,42,.07);--line2:rgba(15,23,42,.13);--blue:#1a56db;--blue-bg:#eff5ff;--blue-t:#1e429f;--green-bg:#f0fdf4;--green-t:#166534;--amber-bg:#fffbeb;--amber-t:#92400e;--red-bg:#fff1f2;--red-t:#9f1239;--pur-bg:#f5f3ff;--pur-t:#5b21b6;--r:8px;--r2:14px}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'A2z','Noto Sans KR',sans-serif;background:var(--sur);color:var(--ink);line-height:1.75}
a{color:inherit;text-decoration:none}
header{position:sticky;top:0;z-index:100;background:rgba(255,255,255,.92);backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
.h-top{max-width:1080px;margin:0 auto;padding:0 24px;height:60px;display:flex;align-items:center;gap:16px}
.logo{display:flex;flex-direction:column;cursor:pointer;flex-shrink:0}
.logo-main{font-size:18px;font-weight:700;color:var(--ink);letter-spacing:-.4px}.logo-main span{color:var(--blue)}
.logo-sub{font-size:10px;color:var(--ink4);text-transform:uppercase;letter-spacing:.3px}
.h-nav{display:flex;align-items:center;gap:2px;margin-left:auto}
.h-nav a{font-size:14px;color:var(--ink3);padding:6px 11px;border-radius:6px;transition:all .15s}
.h-nav a:hover{color:var(--ink);background:var(--sur2)}
.page{max-width:1080px;margin:0 auto;padding:28px 24px 80px}
.breadcrumb-nav{font-size:12px;color:var(--ink4);margin-bottom:12px}.breadcrumb-nav a{color:var(--blue)}
.cat-hero{background:var(--white);border:1px solid var(--line);border-radius:var(--r2);padding:28px;margin-bottom:24px}
.cat-badge{display:inline-flex;background:var(--blue-bg);color:var(--blue-t);font-size:12px;font-weight:600;padding:4px 12px;border-radius:12px;margin-bottom:12px}
h1{font-size:24px;font-weight:700;color:var(--ink);line-height:1.4;margin-bottom:12px;letter-spacing:-.4px}
.cat-intro{font-size:14px;color:var(--ink3);line-height:1.8;max-width:680px}
.fund-list{margin-bottom:32px}
.sec-head{display:flex;align-items:baseline;gap:8px;margin-bottom:12px}
.fcard-link{display:flex!important;justify-content:space-between;align-items:center;border:1px solid var(--line);border-radius:8px;padding:20px 24px;margin-bottom:8px;background:var(--white);transition:border-color .13s;color:inherit;text-decoration:none}.fcard-link:hover{border-color:var(--line2)}.fcard-arr{font-size:13px;color:var(--blue);white-space:nowrap;flex-shrink:0;margin-left:20px;font-weight:500}
.fcard-link{display:flex;justify-content:space-between;align-items:center;border:1px solid var(--line);border-radius:8px;padding:20px 24px;margin-bottom:8px;background:var(--white);transition:border-color .13s;text-decoration:none;color:inherit}.fcard-link:hover{border-color:var(--line2)}.fcard-arr{font-size:13px;color:var(--blue);white-space:nowrap;flex-shrink:0;margin-left:20px}
.fcard{background:var(--white);border-radius:var(--r);padding:18px 20px;margin-bottom:2px;border:1px solid transparent;transition:border-color .15s,box-shadow .15s}
.fcard:hover{border-color:var(--line2);box-shadow:0 2px 14px rgba(15,23,42,.07)}
.fc-tags{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px}
.tag{display:inline-flex;align-items:center;font-size:12px;font-weight:600;padding:3px 8px;border-radius:4px}
.tb{background:var(--blue-bg);color:var(--blue-t)}.tg{background:var(--green-bg);color:var(--green-t)}.ta{background:var(--amber-bg);color:var(--amber-t)}.tr{background:var(--red-bg);color:var(--red-t)}.tp{background:var(--pur-bg);color:var(--pur-t)}.torg{background:var(--sur2);color:var(--ink3)}
.fc-title{font-size:15px;font-weight:700;color:var(--ink);line-height:1.45;margin-bottom:6px}
.fcard:hover .fc-title{color:var(--blue)}
.fc-desc{font-size:13px;color:var(--ink3);line-height:1.65;margin-bottom:11px}
.fc-meta{display:flex;gap:16px;align-items:center}.fm{font-size:12px;color:var(--ink4)}.fm b{color:var(--ink2);font-weight:500}.fm-more{margin-left:auto;font-size:12px;color:var(--blue);font-weight:600}
.faq-section{background:var(--white);border:1px solid var(--line);border-radius:var(--r2);padding:24px 28px;margin-bottom:24px}
.faq-section h2{font-size:16px;font-weight:700;color:var(--ink);margin-bottom:16px;padding-bottom:12px;border-bottom:2px solid var(--blue)}
.faq-item{border:1px solid var(--line);border-radius:var(--r);padding:16px 20px;margin-bottom:10px}
.faq-q{font-size:14px;font-weight:700;color:var(--ink);margin-bottom:6px}.faq-a{font-size:13px;color:var(--ink3);line-height:1.75}
.rel-cats{background:var(--sur2);border-radius:var(--r2);padding:20px 24px;margin-bottom:24px}
.rel-title{font-size:13px;font-weight:700;color:var(--ink3);margin-bottom:12px}
.rel-links{display:flex;flex-wrap:wrap;gap:8px}
.rel-link{font-size:13px;color:var(--ink2);background:var(--white);border:1.5px solid var(--line2);padding:6px 14px;border-radius:16px;transition:all .15s}
.rel-link:hover{border-color:var(--blue);color:var(--blue)}
.d-card{background:var(--white);border-radius:var(--r2);overflow:hidden;border:1px solid var(--line)}
.d-top{padding:26px 26px 22px;border-bottom:1px solid var(--line)}
.d-tags{display:flex;gap:5px;margin-bottom:10px}
.d-title{font-size:22px;font-weight:700;color:var(--ink);line-height:1.38;margin-bottom:10px;letter-spacing:-.5px}
.d-desc{font-size:14px;color:var(--ink3);line-height:1.75}
.d-summary{display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1px solid var(--line)}
.d-si{padding:18px 22px;border-right:1px solid var(--line)}.d-si:last-child{border-right:none}
.d-sl{font-size:11px;color:var(--ink4);letter-spacing:.4px;text-transform:uppercase;margin-bottom:6px}
.d-sv{font-size:19px;font-weight:700;color:var(--blue)}.d-sv.ink{color:var(--ink);font-size:15px}
.d-body{padding:24px 26px}
.d-stitle{font-size:12px;font-weight:700;color:var(--ink4);letter-spacing:.8px;text-transform:uppercase;margin:22px 0 12px;padding-top:22px;border-top:1px solid var(--line)}
.d-stitle:first-child{margin-top:0;padding-top:0;border-top:none}
.info-rows{display:flex;flex-direction:column}
.info-row{display:flex;border-bottom:1px solid var(--line);padding:11px 0}.info-row:last-child{border-bottom:none}
.info-k{width:110px;flex-shrink:0;font-size:13px;color:var(--ink3)}.info-v{flex:1;font-size:13px;color:var(--ink);line-height:1.7}
.step-list{display:flex;flex-direction:column;gap:10px}
.step-item{display:flex;gap:12px;align-items:flex-start}
.step-n{width:22px;height:22px;border-radius:50%;background:var(--blue);color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
.step-t{font-size:13px;color:var(--ink2);line-height:1.65}
.official-btn{display:flex;align-items:center;background:var(--blue-bg);border:1px solid rgba(26,86,219,.15);border-radius:var(--r);padding:14px 18px;margin-top:20px;transition:background .15s;width:100%;text-align:left}
.official-btn:hover{background:#dce9fd}
.ob-text strong{display:block;font-size:13px;font-weight:700;color:var(--blue-t)}.ob-text span{font-size:12px;color:var(--ink3)}
.related-sec{padding:20px 26px;background:var(--sur);border-top:1px solid var(--line)}
.related-title{font-size:11px;font-weight:700;color:var(--ink4);letter-spacing:.6px;text-transform:uppercase;margin-bottom:10px}
.rel-cards{display:flex;flex-direction:column;gap:6px}
.rel-card{display:flex;align-items:center;gap:8px;padding:9px 12px;background:var(--white);border:1px solid var(--line);border-radius:var(--r);transition:border-color .15s}.rel-card:hover{border-color:var(--blue)}
.rel-card-title{font-size:13px;color:var(--ink)}
.c-strip{background:#0f172a;color:#fff;height:46px;display:flex;align-items:center}.c-strip-in{max-width:1080px;margin:0 auto;padding:0 24px;width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px}.c-strip-label{font-size:14px;color:rgba(255,255,255,.55);display:flex;align-items:center;gap:9px}.c-strip-label strong{color:rgba(255,255,255,.92);font-weight:700;font-size:14px}.c-dot{width:6px;height:6px;border-radius:50%;background:#4ade80;animation:blink 2s infinite;flex-shrink:0}@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}.btn-strip{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.22);color:rgba(255,255,255,.9);font-size:13px;font-weight:600;padding:6px 16px;border-radius:14px;text-decoration:none;white-space:nowrap;transition:background .15s}.btn-strip:hover{background:rgba(255,255,255,.22)}.ad-label{font-size:10px;color:rgba(255,255,255,.3);letter-spacing:.5px;flex-shrink:0}.pnav{background:var(--white);border-bottom:1px solid var(--line);overflow-x:auto;scrollbar-width:none}.pnav::-webkit-scrollbar{display:none}.pnav-in{max-width:1080px;margin:0 auto;padding:0 24px;display:flex;align-items:center;gap:0}.pnav-back{display:flex;align-items:center;gap:5px;font-size:13px;color:var(--ink3);padding:10px 14px 10px 0;margin-right:8px;border-right:1px solid var(--line);cursor:pointer;white-space:nowrap;text-decoration:none;transition:color .13s;flex-shrink:0}.pnav-back:hover{color:var(--blue)}.pnav-back svg{width:14px;height:14px}.pnt{font-size:13.5px;color:var(--ink3);padding:11px 14px;white-space:nowrap;border-bottom:2.5px solid transparent;text-decoration:none;flex-shrink:0;font-weight:500;transition:color .13s}.pnt:hover{color:var(--ink)}.pnt.on{color:var(--blue);border-bottom-color:var(--blue);font-weight:700}.pnt-region{color:var(--blue)}footer{background:var(--white);border-top:1px solid var(--line);padding:28px 24px}
.pnav{background:var(--white);border-bottom:1px solid var(--line);overflow-x:auto;scrollbar-width:none;position:sticky;top:57px;z-index:90}.pnav::-webkit-scrollbar{display:none}.pnav-in{max-width:1080px;margin:0 auto;padding:0 20px;display:flex;align-items:center;gap:0}.pnav-back{display:flex;align-items:center;gap:5px;color:var(--ink3);font-size:13px;padding:10px 14px 10px 8px;border-right:1px solid var(--line);margin-right:4px;cursor:pointer;white-space:nowrap;text-decoration:none;flex-shrink:0;transition:color .13s}.pnav-back:hover{color:var(--blue)}.pnav-back svg{width:14px;height:14px;flex-shrink:0}.pnav-tab{font-size:13px;color:var(--ink3);padding:10px 13px;white-space:nowrap;border-bottom:2px solid transparent;cursor:pointer;user-select:none;flex-shrink:0;font-weight:500;text-decoration:none;transition:color .13s;display:block}.pnav-tab:hover{color:var(--ink)}.pnav-tab.cur{color:var(--blue);border-bottom-color:var(--blue);font-weight:700}.foot-in{max-width:1080px;margin:0 auto;display:flex;flex-direction:column;gap:10px}
.foot-links{display:flex;flex-wrap:wrap;gap:6px 20px;justify-content:center}
.foot-links a{font-size:12px;color:var(--ink4)}.foot-links a:hover{color:var(--blue)}
.foot-copy{font-size:12px;color:var(--ink4);text-align:center}
.foot-notice{font-size:11px;color:var(--ink4);text-align:center;line-height:1.7;max-width:680px;margin:0 auto}
@media(max-width:768px){.h-nav{display:none}.h-top{padding:0 14px;height:50px}.logo-main{font-size:16px}.logo-sub{font-size:9px}.c-strip{height:40px}.c-strip-in{padding:0 14px;gap:10px}.c-strip-label>span:not(.ad-label){display:none}.c-strip-label{font-size:12px;gap:6px}.btn-strip{font-size:12px;padding:5px 13px;flex-shrink:0}.pnav-in{padding:0 10px}.pnav-back{font-size:11px;padding:8px 8px 8px 0;margin-right:4px}.pnt{font-size:11px;padding:8px 8px}.page{padding:12px 12px 40px}.cat-hero{padding:14px 14px 12px;margin-bottom:12px}.cat-badge{font-size:10px;margin-bottom:5px}.d-title{font-size:18px;margin-bottom:5px;line-height:1.3}.cat-intro{font-size:12.5px;line-height:1.55}.d-summary{grid-template-columns:repeat(3,1fr)}.d-si{padding:10px 8px}.d-sl{font-size:10px;margin-bottom:2px}.d-sv{font-size:13px}.fund-list{margin-bottom:12px}.fcard-link{padding:11px 12px;margin-bottom:6px}.fcard-arr{font-size:11px;margin-left:6px}.fc-title{font-size:13px;margin-bottom:2px}.fc-desc{font-size:12px;line-height:1.4}.fc-meta{font-size:10.5px;flex-wrap:wrap;gap:4px;margin-top:3px}.fc-tags{gap:3px;margin-bottom:4px}.tag{font-size:9.5px;padding:1px 5px}.ob-table td,.ob-table th{font-size:12px;padding:8px 10px}.ob-text{font-size:12.5px;line-height:1.55;padding:14px}.step-n{width:22px;height:22px;font-size:10px}.step-t{font-size:12px}.faq-item{padding:10px 0}.faq-q{font-size:13px}.faq-a{font-size:12.5px;line-height:1.55}.sec-head{margin-bottom:8px;padding-bottom:6px}.sec-name{font-size:13px}.sec-cnt{font-size:11px}.breadcrumb-nav{font-size:10.5px;padding:6px 0;margin-bottom:10px}.foot-in{padding:16px 12px}.foot-copy{font-size:10.5px}.foot-notice{font-size:10.5px}}</style>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-WKSNYHFY7N"><\/script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-WKSNYHFY7N',{send_page_view:true});<\/script><script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-ML9DWRB3');<\/script></head>>
<body>
<header>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-ML9DWRB3" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <div class="h-top">
    <a href="/" class="logo">
      <span class="logo-main">\uC815\uCC45\uC790\uAE08 <span>\uBC31\uACFC</span></span>
      <span class="logo-sub">Government Fund Guide</span>
    </a>
    <nav class="h-nav">
      <a href="/">\uC804\uCCB4</a>
      <a href="/\uC18C\uC0C1\uACF5\uC778-\uC815\uCC45\uC790\uAE08/">\uC18C\uC0C1\uACF5\uC778</a>
      <a href="/\uCC3D\uC5C5\uC9C0\uC6D0\uAE08-\uC885\uB958/">\uCC3D\uC5C5</a>
      <a href="/\uC911\uC18C\uAE30\uC5C5-\uC815\uCC45\uC790\uAE08/">\uC911\uC18C\uAE30\uC5C5</a>
      <a href="/\uACE0\uC6A9\uC9C0\uC6D0\uAE08-\uC2E0\uCCAD\uBC29\uBC95/">\uACE0\uC6A9</a>
      <a href="/\uBE44\uC0AC\uC5C5\uC790-\uC11C\uBBFC\uAE08\uC735/">\uC11C\uBBFC\uAE08\uC735</a>
    </nav>
  </div>
</header>
  <div class="c-strip"><div class="c-strip-in"><div class="c-strip-label"><span class="c-dot"></span><strong>\uBBFC\uAC04 \uCEE8\uC124\uD134\uD2B8</strong><span class="ad-label" style="font-size:10px;color:rgba(255,255,255,.3);letter-spacing:.5px;flex-shrink:0">\uAD11\uACE0</span></div><a href="/?contact=1" class="btn-strip">\uBB38\uC758\uD558\uAE30 \u2192</a></div></div>
<nav class="pnav"><div class="pnav-in"><a href="javascript:history.back()" class="pnav-back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>\uB4A4\uB85C</a><a href="/" class="pnav-tab" data-path="/">\uC804\uCCB4</a><a href="/\uC18C\uC0C1\uACF5\uC778-\uC815\uCC45\uC790\uAE08/" class="pnav-tab" data-path="/\uC18C\uC0C1\uACF5\uC778-\uC815\uCC45\uC790\uAE08/">\uC18C\uC0C1\uACF5\uC778</a><a href="/\uCC3D\uC5C5\uC9C0\uC6D0\uAE08-\uC885\uB958/" class="pnav-tab" data-path="/\uCC3D\uC5C5\uC9C0\uC6D0\uAE08-\uC885\uB958/">\uCC3D\uC5C5</a><a href="/\uC911\uC18C\uAE30\uC5C5-\uC815\uCC45\uC790\uAE08/" class="pnav-tab" data-path="/\uC911\uC18C\uAE30\uC5C5-\uC815\uCC45\uC790\uAE08/">\uC911\uC18C\uAE30\uC5C5</a><a href="/\uACE0\uC6A9\uC9C0\uC6D0\uAE08-\uC2E0\uCCAD\uBC29\uBC95/" class="pnav-tab" data-path="/\uACE0\uC6A9\uC9C0\uC6D0\uAE08-\uC2E0\uCCAD\uBC29\uBC95/">\uACE0\uC6A9</a><a href="/\uBE44\uC0AC\uC5C5\uC790-\uC11C\uBBFC\uAE08\uC735/" class="pnav-tab" data-path="/\uBE44\uC0AC\uC5C5\uC790-\uC11C\uBBFC\uAE08\uC735/">\uC11C\uBBFC\uAE08\uC735</a></div></nav><script>!function(){var p=location.pathname,tabs=document.querySelectorAll('.pnav-tab');tabs.forEach(function(t){if(p===t.dataset.path||p.startsWith(t.dataset.path.replace(//$/,''))&&t.dataset.path!=='/'){t.classList.add('cur');}});}();<\/script><div class="page">${body}</div>
<footer>
  <div class="foot-in">
    <div class="foot-links">
      <a href="https://www.semas.or.kr" target="_blank">\uC18C\uC0C1\uACF5\uC778\uC2DC\uC7A5\uC9C4\uD765\uACF5\uB2E8</a>
      <a href="https://www.bizinfo.go.kr" target="_blank">\uAE30\uC5C5\uB9C8\uB2F9</a>
      <a href="https://www.mss.go.kr" target="_blank">\uC911\uC18C\uBCA4\uCC98\uAE30\uC5C5\uBD80</a>
      <a href="https://www.work24.go.kr" target="_blank">\uACE0\uC6A924</a>
      <a href="https://www.k-startup.go.kr" target="_blank">K-\uC2A4\uD0C0\uD2B8\uC5C5</a>
      <a href="https://www.kinfa.or.kr" target="_blank">\uC11C\uBBFC\uAE08\uC735\uC9C4\uD765\uC6D0</a>
    </div>
    <div class="foot-copy">\xA9 2026 \uC815\uCC45\uC790\uAE08 \uBC31\uACFC</div>
    <div class="foot-notice">\uBCF8 \uC0AC\uC774\uD2B8\uB294 \uC815\uBD80 \uC815\uCC45\uC790\uAE08\uC5D0 \uAD00\uD55C \uC815\uBCF4\uB97C \uC815\uB9AC\xB7\uC81C\uACF5\uD558\uB294 \uC815\uBCF4\uC131 \uC0AC\uC774\uD2B8\uC785\uB2C8\uB2E4. \uC2E4\uC81C \uC9C0\uC6D0 \uC870\uAC74\uACFC \uAE08\uC561\uC740 \uAC01 \uAE30\uAD00\uC758 \uACF5\uC2DD \uACF5\uACE0\uB97C \uBC18\uB4DC\uC2DC \uD655\uC778\uD558\uC2DC\uAE30 \uBC14\uB78D\uB2C8\uB2E4.</div>
  </div>
</footer>
</body></html>`;
}
__name(pageShell, "pageShell");
__name2(pageShell, "pageShell");
function parseRow(r) {
  return { ...r, steps: tryParse(r.steps, []), tags: tryParse(r.tags, []), target: tryParse(r.target, []) };
}
__name(parseRow, "parseRow");
__name2(parseRow, "parseRow");
function tryParse(s, fb) {
  try {
    return typeof s === "string" ? JSON.parse(s) : s;
  } catch {
    return fb;
  }
}
__name(tryParse, "tryParse");
__name2(tryParse, "tryParse");
function esc(s) {
  return (s || "").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
__name(esc, "esc");
__name2(esc, "esc");
function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json;charset=utf-8", ...CORS } });
}
__name(json, "json");
__name2(json, "json");
function html(body) {
  return new Response(body, { headers: { "Content-Type": "text/html;charset=utf-8" } });
}
__name(html, "html");
__name2(html, "html");
async function handleRegionPage(p, env) {
  const catMap = {
    base: "\uC18C\uC0C1\uACF5\uC778",
    industry_retail: "\uC18C\uC0C1\uACF5\uC778",
    industry_construction: "\uC911\uC18C\uAE30\uC5C5",
    industry_care: "\uC18C\uC0C1\uACF5\uC778",
    situation_youth: "\uCC3D\uC5C5",
    situation_women: "\uC18C\uC0C1\uACF5\uC778",
    situation_restart: "\uC18C\uC0C1\uACF5\uC778",
    situation_senior: "\uC18C\uC0C1\uACF5\uC778"
  };
  const funds = await env.DB.prepare("SELECT * FROM funds WHERE cat=? ORDER BY id LIMIT 6").bind(catMap[p.type] || "\uC18C\uC0C1\uACF5\uC778").all();
  const items = (funds.results || []).map(parseRow);
  const cardsHtml = items.map(
    (f) => `<a href="/${f.slug}/" class="fcard-link">
      <div class="fcard">
        <div class="fc-tags">${(f.tags || []).map((t) => `<span class="tag ${t.c}">${t.t}</span>`).join("")}<span class="tag torg">${f.org}</span></div>
        <div class="fc-title">${f.title}</div>
        <div class="fc-desc">${f.excerpt}</div>
        <div class="fc-meta">
          <span class="fm">\uD55C\uB3C4 <b>${f.lim}</b></span>
          <span class="fm">\uAE08\uB9AC <b>${f.rate}</b></span>
          <span class="fm-more">\uC790\uC138\uD788 \uBCF4\uAE30 \u2192</span>
        </div>
      </div>
    </a>`
  ).join("");
  const RA = { "\uC11C\uC6B8": [{ n: "\uC11C\uC6B8\uC2E0\uC6A9\uBCF4\uC99D\uC7AC\uB2E8", u: "https://www.seoulshinbo.co.kr/", d: "\uC11C\uC6B8\uC2DC \uC911\uC18C\uAE30\uC5C5 \uC721\uC131\uC790\uAE08 \uC5F0 2.0~3.3%" }, { n: "\uC11C\uC6B8\uACBD\uC81C\uC9C4\uD765\uC6D0(SBA)", u: "https://www.sba.seoul.kr/", d: "\uC11C\uC6B8 \uCC3D\uC5C5\uC9C0\uC6D0\xB7\uD310\uB85C\uAC1C\uCC99" }], "\uACBD\uAE30": [{ n: "\uACBD\uAE30\uC2E0\uC6A9\uBCF4\uC99D\uC7AC\uB2E8", u: "https://www.gcgf.or.kr/", d: "\uACBD\uAE30\uB3C4 \uC911\uC18C\uAE30\uC5C5 \uC721\uC131\uC790\uAE08 \uC5F0 2~3%" }, { n: "\uACBD\uAE30\uACBD\uC81C\uACFC\uD559\uC9C4\uD765\uC6D0", u: "https://www.gbsa.or.kr/", d: "\uACBD\uAE30\uB3C4 \uCC3D\uC5C5\xB7R&D \uC9C0\uC6D0" }], "\uBD80\uC0B0": [{ n: "\uBD80\uC0B0\uC2E0\uC6A9\uBCF4\uC99D\uC7AC\uB2E8", u: "https://www.busancredit.or.kr/", d: "\uBD80\uC0B0\uC2DC \uC911\uC18C\uAE30\uC5C5\xB7\uC18C\uC0C1\uACF5\uC778 \uBCF4\uC99D" }, { n: "\uBD80\uC0B0\uACBD\uC81C\uC9C4\uD765\uC6D0", u: "https://www.bepa.kr/", d: "\uBD80\uC0B0 \uCC3D\uC5C5\xB7\uAE30\uC5C5\uC9C0\uC6D0" }], "\uB300\uAD6C": [{ n: "\uB300\uAD6C\uC2E0\uC6A9\uBCF4\uC99D\uC7AC\uB2E8", u: "https://www.daegucredit.or.kr/", d: "\uB300\uAD6C\uC2DC \uC18C\uC0C1\uACF5\uC778\xB7\uC911\uC18C\uAE30\uC5C5 \uBCF4\uC99D" }, { n: "\uB300\uAD6C\uACBD\uC81C\uC9C4\uD765\uC6D0", u: "https://www.deipa.or.kr/", d: "\uB300\uAD6C \uCC3D\uC5C5\xB7\uD22C\uC790 \uC9C0\uC6D0" }], "\uC778\uCC9C": [{ n: "\uC778\uCC9C\uC2E0\uC6A9\uBCF4\uC99D\uC7AC\uB2E8", u: "https://www.icredit.or.kr/", d: "\uC778\uCC9C\uC2DC \uC911\uC18C\uAE30\uC5C5\xB7\uC18C\uC0C1\uACF5\uC778 \uBCF4\uC99D" }, { n: "\uC778\uCC9C\uD14C\uD06C\uB178\uD30C\uD06C", u: "https://www.itp.or.kr/", d: "\uC778\uCC9C \uAE30\uC5C5\uC9C0\uC6D0\xB7\uCC3D\uC5C5 \uC11C\uBE44\uC2A4" }], "\uAD11\uC8FC": [{ n: "\uAD11\uC8FC\uC2E0\uC6A9\uBCF4\uC99D\uC7AC\uB2E8", u: "https://www.gjcredit.or.kr/", d: "\uAD11\uC8FC\uC2DC \uC18C\uC0C1\uACF5\uC778\xB7\uC911\uC18C\uAE30\uC5C5 \uBCF4\uC99D" }, { n: "\uAD11\uC8FC\uACBD\uC81C\uACE0\uC6A9\uC9C4\uD765\uC6D0", u: "https://www.gjep.or.kr/", d: "\uAD11\uC8FC \uCC3D\uC5C5\xB7\uAE30\uC5C5 \uC9C0\uC6D0" }], "\uB300\uC804": [{ n: "\uB300\uC804\uC2E0\uC6A9\uBCF4\uC99D\uC7AC\uB2E8", u: "https://www.djcredit.or.kr/", d: "\uB300\uC804\uC2DC \uC18C\uC0C1\uACF5\uC778\xB7\uC911\uC18C\uAE30\uC5C5 \uBCF4\uC99D" }, { n: "\uB300\uC804\uACBD\uC81C\uD1B5\uC0C1\uC9C4\uD765\uC6D0", u: "https://www.dba.or.kr/", d: "\uB300\uC804 \uCC3D\uC5C5\xB7\uC218\uCD9C \uC9C0\uC6D0" }], "\uC6B8\uC0B0": [{ n: "\uC6B8\uC0B0\uC2E0\uC6A9\uBCF4\uC99D\uC7AC\uB2E8", u: "https://www.uscredit.or.kr/", d: "\uC6B8\uC0B0\uC2DC \uC18C\uC0C1\uACF5\uC778\xB7\uC911\uC18C\uAE30\uC5C5 \uBCF4\uC99D" }, { n: "\uC6B8\uC0B0\uACBD\uC81C\uC9C4\uD765\uC6D0", u: "https://www.uepa.or.kr/", d: "\uC6B8\uC0B0 \uAE30\uC5C5\uC9C0\uC6D0\xB7\uC0B0\uC5C5\uB2E8\uC9C0" }], "\uC138\uC885": [{ n: "\uC138\uC885\uC2DC \uAE30\uC5C5\uC9C0\uC6D0", u: "https://www.sejong.go.kr/", d: "\uC138\uC885\uC2DC \uC911\uC18C\uAE30\uC5C5\xB7\uCC3D\uC5C5 \uC9C0\uC6D0" }, { n: "\uCDA9\uB0A8\uC2E0\uC6A9\uBCF4\uC99D\uC7AC\uB2E8", u: "https://www.cncredit.or.kr/", d: "\uC138\uC885\xB7\uCDA9\uB0A8 \uC911\uC18C\uAE30\uC5C5 \uBCF4\uC99D" }], "\uAC15\uC6D0": [{ n: "\uAC15\uC6D0\uC2E0\uC6A9\uBCF4\uC99D\uC7AC\uB2E8", u: "https://www.gcredit.or.kr/", d: "\uAC15\uC6D0\uB3C4 \uC18C\uC0C1\uACF5\uC778\xB7\uC911\uC18C\uAE30\uC5C5 \uBCF4\uC99D" }, { n: "\uAC15\uC6D0\uACBD\uC81C\uC9C4\uD765\uC6D0", u: "https://www.gwep.or.kr/", d: "\uAC15\uC6D0 \uCC3D\uC5C5\xB7\uAE30\uC5C5 \uC9C0\uC6D0" }], "\uCDA9\uBD81": [{ n: "\uCDA9\uBD81\uC2E0\uC6A9\uBCF4\uC99D\uC7AC\uB2E8", u: "https://www.cbcredit.or.kr/", d: "\uCDA9\uBD81 \uC18C\uC0C1\uACF5\uC778\xB7\uC911\uC18C\uAE30\uC5C5 \uBCF4\uC99D" }, { n: "\uCDA9\uBD81\uACBD\uC81C\uC9C4\uD765\uC6D0", u: "https://www.cbipa.or.kr/", d: "\uCDA9\uBD81 \uCC3D\uC5C5\xB7\uD22C\uC790 \uC9C0\uC6D0" }], "\uCDA9\uB0A8": [{ n: "\uCDA9\uB0A8\uC2E0\uC6A9\uBCF4\uC99D\uC7AC\uB2E8", u: "https://www.cncredit.or.kr/", d: "\uCDA9\uB0A8 \uC18C\uC0C1\uACF5\uC778\xB7\uC911\uC18C\uAE30\uC5C5 \uBCF4\uC99D" }, { n: "\uCDA9\uB0A8\uACBD\uC81C\uC9C4\uD765\uC6D0", u: "https://www.cepa.or.kr/", d: "\uCDA9\uB0A8 \uCC3D\uC5C5\xB7\uAE30\uC5C5 \uC9C0\uC6D0" }], "\uC804\uBD81": [{ n: "\uC804\uBD81\uC2E0\uC6A9\uBCF4\uC99D\uC7AC\uB2E8", u: "https://www.jbcredit.or.kr/", d: "\uC804\uBD81 \uC18C\uC0C1\uACF5\uC778\xB7\uC911\uC18C\uAE30\uC5C5 \uBCF4\uC99D" }, { n: "\uC804\uBD81\uACBD\uC81C\uD1B5\uC0C1\uC9C4\uD765\uC6D0", u: "https://www.jbepa.or.kr/", d: "\uC804\uBD81 \uCC3D\uC5C5\xB7\uC218\uCD9C \uC9C0\uC6D0" }], "\uC804\uB0A8": [{ n: "\uC804\uB0A8\uC2E0\uC6A9\uBCF4\uC99D\uC7AC\uB2E8", u: "https://www.jncredit.or.kr/", d: "\uC804\uB0A8 \uC18C\uC0C1\uACF5\uC778\xB7\uC911\uC18C\uAE30\uC5C5 \uBCF4\uC99D" }, { n: "\uC804\uB0A8\uACBD\uC81C\uC9C4\uD765\uC6D0", u: "https://www.jnipa.or.kr/", d: "\uC804\uB0A8 \uCC3D\uC5C5\xB7\uAE30\uC5C5 \uC9C0\uC6D0" }], "\uACBD\uBD81": [{ n: "\uACBD\uBD81\uC2E0\uC6A9\uBCF4\uC99D\uC7AC\uB2E8", u: "https://www.gbcredit.or.kr/", d: "\uACBD\uBD81 \uC18C\uC0C1\uACF5\uC778\xB7\uC911\uC18C\uAE30\uC5C5 \uBCF4\uC99D" }, { n: "\uACBD\uBD81\uACBD\uC81C\uC9C4\uD765\uC6D0", u: "https://www.gbepa.or.kr/", d: "\uACBD\uBD81 \uCC3D\uC5C5\xB7\uD22C\uC790 \uC9C0\uC6D0" }], "\uACBD\uB0A8": [{ n: "\uACBD\uB0A8\uC2E0\uC6A9\uBCF4\uC99D\uC7AC\uB2E8", u: "https://www.gncredit.or.kr/", d: "\uACBD\uB0A8 \uC18C\uC0C1\uACF5\uC778\xB7\uC911\uC18C\uAE30\uC5C5 \uBCF4\uC99D" }, { n: "\uACBD\uB0A8\uACBD\uC81C\uC9C4\uD765\uC6D0", u: "https://www.gnipa.or.kr/", d: "\uACBD\uB0A8 \uCC3D\uC5C5\xB7\uAE30\uC5C5 \uC9C0\uC6D0" }], "\uC81C\uC8FC": [{ n: "\uC81C\uC8FC\uC2E0\uC6A9\uBCF4\uC99D\uC7AC\uB2E8", u: "https://www.jejucredit.or.kr/", d: "\uC81C\uC8FC \uC18C\uC0C1\uACF5\uC778\xB7\uC911\uC18C\uAE30\uC5C5 \uBCF4\uC99D" }, { n: "\uC81C\uC8FC\uD14C\uD06C\uB178\uD30C\uD06C", u: "https://www.jejutp.or.kr/", d: "\uC81C\uC8FC \uCC3D\uC5C5\xB7R&D \uC9C0\uC6D0" }] };
  const ag = RA[p.region] || [];
  const liveHtml = ag.length ? `<div class="fund-list" style="margin-top:28px"><div class="sec-head"><span class="sec-name">\u{1F3DB} ${p.region} \uC9C0\uC5ED \uC9C0\uC6D0\uAE30\uAD00</span><span class="sec-cnt" style="color:var(--blue)">\uACF5\uC2DD \uB9C1\uD06C</span></div>${ag.map((a) => `<a href="${a.u}" target="_blank" rel="noopener" class="fcard-link"><div class="fcard" style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px"><div><div class="fc-tags" style="margin-bottom:6px"><span class="tag tb">${p.region}</span><span class="tag torg">\uACF5\uC2DD\uAE30\uAD00</span></div><div class="fc-title">${a.n}</div><div class="fc-desc" style="margin-top:4px">${a.d}</div></div><span style="font-size:20px;flex-shrink:0;margin-left:12px">\u2197</span></div></a>`).join("")}</div>` : "";
  const relLinks = Object.entries(CAT_PAGES).map(([s, m]) => `<a href="/${s}/" class="rel-link">${m.cat}</a>`).join("");
  const faqSchema = `{"@type":"Question","name":"${esc(p.h1)} \uC2E0\uCCAD \uBC29\uBC95\uC740?","acceptedAnswer":{"@type":"Answer","text":"${esc(p.intro)}"}}`;
  return html(pageShell({
    title: `${p.title} | \uC815\uCC45\uC790\uAE08 \uBC31\uACFC`,
    desc: p.description,
    keywords: p.keywords,
    canonical: `${BASE}/${p.slug}/`,
    faqSchema,
    breadcrumb: [["\uD648", `${BASE}/`], [p.region, `${BASE}/${p.region}-\uC815\uCC45\uC790\uAE08/`], [p.type_name, `${BASE}/${p.slug}/`]],
    body: `
      <div class="cat-hero">
        <div class="cat-badge">${p.region} \xB7 ${p.type_name}</div>
        <h1>${p.h1}</h1>
        <p class="cat-intro">${p.intro}</p>
      </div>
      <div class="fund-list">
        <div class="sec-head"><span class="sec-name">\uAD00\uB828 \uC815\uCC45\uC790\uAE08</span><span class="sec-cnt">${items.length}\uAC74</span></div>
        ${cardsHtml}
      </div>
              ${liveHtml}
              <div class="rel-cats">
        <div class="rel-title">\uB2E4\uB978 \uC815\uCC45\uC790\uAE08 \uC815\uBCF4</div>
        <div class="rel-links"><a href="/" class="rel-link">\uC804\uCCB4 \uBCF4\uAE30</a>${relLinks}</div>
      </div>`
  }));
}
__name(handleRegionPage, "handleRegionPage");
__name2(handleRegionPage, "handleRegionPage");
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
