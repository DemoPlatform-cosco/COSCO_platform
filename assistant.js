(() => {
  const panda = document.getElementById('assistant-panda');
  const dialog = document.getElementById('assistant-dialog');
  const input = document.getElementById('assistant-input');
  if (!panda || !dialog || !input) return;

  panda.addEventListener('click', () => {
    dialog.classList.add('show');
    setTimeout(() => input.focus(), 10);
  });

  // Demo button: auto-fill input, show output, open choice modal
  const demoBtn = document.getElementById('assistant-demo-btn');
  if (demoBtn) {
    demoBtn.addEventListener('click', () => {
      dialog.classList.add('show');
      const demoText = '熊猫船长，客户FHS公司有一批成套自动化产线需要出口到美国TESLA，送货地址1 Semi Drive, Sparks, NV 89437，成交方式为DDP，该批次成套产线的件数、尺寸、重量及各项品名已上传附件清单，要求1、12月31日前送到客户处，2、确认目的地各项品名税率，请给出全程运输方案和建议';
      input.value = demoText;
      setTimeout(() => input.focus(), 10);

      // After 1s, show output box
      setTimeout(() => {
        let output = document.getElementById('assistant-output');
        if (!output) {
          const bubble = dialog.querySelector('.assistant-bubble');
          output = document.createElement('div');
          output.id = 'assistant-output';
          output.className = 'assistant-output';
          bubble.appendChild(output);
        }
        const resultText = '根据货物清单，预计货物需要53FEU装载，运输方案一、拖车通过上海港运输至OAKLAND，清关后送至目的地；方案二、目的港选择LA/LB，然后通过铁路转运至目的地，当前可供选择的船期为AAC4,CEN。预计方案二可以节约运输时间5天。根据当前美国公布税率，该批次产品目的地税率为基础关税2.5%，芬太尼关税10%，232关税25%，301关税20%，对等关税10%，其中货架产品可能涉及反倾销/反补贴税，请补充上传货物图片、材质、规格、制造方法以便提前确认。';
        output.textContent = resultText;

        // After additional 2s, show choice modal once
        setTimeout(() => {
          showChoiceModal();
        }, 2000);
      }, 1000);
    });
  }

  function showChoiceModal() {
    const overlay = document.createElement('div');
    overlay.className = 'choice-modal';
    const dialog = document.createElement('div');
    dialog.className = 'choice-dialog';
    const title = document.createElement('div');
    title.className = 'choice-title';
    title.textContent = '选择下一步操作';
    const actions = document.createElement('div');
    actions.className = 'choice-actions';
    const btnPlan = document.createElement('button');
    btnPlan.className = 'choice-btn';
    btnPlan.textContent = '生成运输方案及报价单';
    const btnBook = document.createElement('button');
    btnBook.className = 'choice-btn';
    btnBook.textContent = '订舱';
    actions.appendChild(btnPlan);
    actions.appendChild(btnBook);
    dialog.appendChild(title);
    dialog.appendChild(actions);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    function close() { overlay.remove(); }
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    btnPlan.addEventListener('click', () => { close(); });
    btnBook.addEventListener('click', () => { close(); });
  }
})();


