function switchTab(name,btn){
  document.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('tab-'+name).classList.add('active');
  btn.classList.add('active');
}

function irACompra(plan,precio){
  document.querySelectorAll('.tab-btn')[1].click();
  setTimeout(()=>{
    const prod=PRODUCTS.find(p=>p.name===plan)||PRODUCTS[0];
    if(!cart.find(i=>i.id===prod.id)){
      cart.push({...prod,qty:1});
    }
    currentStep=1;
    renderAll();
  },100);
}

function cerrarModal(){document.getElementById('modal').classList.remove('active')}
let currentStep=0;
let cart=[];
let shippingSelected=null;
let payTabSelected='card';
let bankSelected=null;
let walletSelected=null;
let cashSelected=null;
let uploadedDocs={cedula:null,contrato:null};

const PRODUCTS=[
  {id:1,name:'GlobalSemestres',tag:'Básico',price:120,desc:'Cobertura completa por semestre, protección universitaria básica'},
  {id:2,name:'GlobalUniversidad',tag:'Premium',price:240,desc:'Cobertura premium, apoyo académico y protección familiar',popular:true},
  {id:3,name:'Global Platinum',tag:'Platinum',price:350,desc:'Cobertura total, seguro de vida y protección internacional'},
  {id:4,name:'Plan Familia',tag:'Familia',price:180,desc:'Protege a toda tu familia con beneficios extendidos'},
];

const SHIPPING=[
  {id:'email',name:'Envío digital',desc:'Documentos enviados a tu correo en 24h',price:0},
  {id:'express',name:'Mensajería express',desc:'Entrega física en 48 horas hábiles',price:15},
  {id:'pickup',name:'Retiro en oficina',desc:'Recoge en cualquiera de nuestros puntos',price:0},
];

function getTotal(){
  const sub=cart.reduce((a,i)=>a+i.price*i.qty,0);
  const ship=shippingSelected?SHIPPING.find(s=>s.id===shippingSelected)?.price||0:0;
  return{sub,ship,total:sub+ship};
}

function renderSummary(){
  const sb=document.getElementById('summaryBody');
  if(!sb)return;
  const {sub,ship,total}=getTotal();
  if(cart.length===0){
    sb.innerHTML='<p style="font-size:13px;color:var(--gray-text);text-align:center;padding:14px 0">Agrega productos para ver tu resumen</p>';
    return;
  }
  let html='';
  cart.forEach(i=>{
    html+=`<div class="summary-line"><span>${i.name} x${i.qty}</span><span>$${i.price*i.qty}</span></div>`;
  });
  html+=`<div class="summary-line"><span>Subtotal</span><span>$${sub}</span></div>`;
  if(shippingSelected)html+=`<div class="summary-line"><span>Envío</span><span>${ship===0?'Gratis':'$'+ship}</span></div>`;
  html+=`<div class="summary-line total"><span>Total</span><span>$${total}/mes</span></div>`;
  sb.innerHTML=html;
}

function updateProgressBar(){
  document.querySelectorAll('.step-tab').forEach((t,i)=>{
    t.classList.remove('active','done');
    if(i<currentStep)t.classList.add('done');
    else if(i===currentStep)t.classList.add('active');
  });
}

function showSideAction(label,fn){
  const sa=document.getElementById('sidebarActions');
  const btn=document.getElementById('sideActionBtn');
  if(!sa||!btn)return;
  sa.style.display='block';
  btn.textContent=label;
  btn.onclick=fn;
}
function hideSideAction(){
  const sa=document.getElementById('sidebarActions');
  if(sa)sa.style.display='none';
}

function renderAll(){
  updateProgressBar();
  renderSummary();
  const mc=document.getElementById('mainContent');
  if(!mc)return;
  switch(currentStep){
    case 0:renderCatalog(mc);break;
    case 1:renderCart(mc);break;
    case 2:renderShipping(mc);break;
    case 3:renderPayment(mc);break;
    case 4:renderDocuments(mc);break;
    case 5:renderConfirm(mc);break;
  }
}

function renderCatalog(mc){
  hideSideAction();
  mc.innerHTML=`<div class="panel">
    <div class="panel-header"><h2>Catálogo de Planes</h2><p>Selecciona los planes que deseas adquirir</p></div>
    <div class="panel-body">
      <div class="catalog-grid">
        ${PRODUCTS.map(p=>`
          <div class="product-card ${cart.find(i=>i.id===p.id)?'selected':''}" onclick="toggleProduct(${p.id})">
            <div class="product-tag ${p.popular?'popular':''}">${p.tag}</div>
            <div class="product-name">${p.name}</div>
            <div class="product-desc">${p.desc}</div>
            <div class="product-price">$${p.price}<span>/mes</span></div>
            <div class="product-check">✓</div>
          </div>`).join('')}
      </div>
      <div class="nav-btns">
        <button class="btn-primary-cp" onclick="if(cart.length>0){currentStep=1;renderAll()}else{alert('Selecciona al menos un plan')}">
          Continuar al carrito →
        </button>
      </div>
    </div>
  </div>`;
}

function toggleProduct(id){
  const idx=cart.findIndex(i=>i.id===id);
  if(idx>=0)cart.splice(idx,1);
  else cart.push({...PRODUCTS.find(p=>p.id===id),qty:1});
  renderAll();
}

function renderCart(mc){
  if(cart.length===0){
    mc.innerHTML=`<div class="panel"><div class="panel-header"><h2>Carrito</h2></div><div class="panel-body"><div class="empty-cart"><div style="font-size:48px">🛒</div><h3>Tu carrito está vacío</h3><p>Regresa al catálogo para agregar planes</p><button class="btn-primary-cp" style="width:auto;margin-top:16px;padding:12px 28px" onclick="currentStep=0;renderAll()">← Ir al catálogo</button></div></div></div>`;
    hideSideAction();return;
  }
  mc.innerHTML=`<div class="panel">
    <div class="panel-header"><h2>Tu Carrito</h2><p>${cart.length} plan(es) seleccionado(s)</p></div>
    <div class="panel-body">
      <table class="cart-table">
        <thead><tr><th>Plan</th><th>Cantidad</th><th>Precio/mes</th><th></th></tr></thead>
        <tbody>
          ${cart.map(i=>`<tr>
            <td><strong>${i.name}</strong><br><span style="font-size:11px;color:var(--gray-text)">${i.tag}</span></td>
            <td><div class="qty-ctrl">
              <button class="qty-btn" onclick="changeQty(${i.id},-1)">-</button>
              <span class="qty-val">${i.qty}</span>
              <button class="qty-btn" onclick="changeQty(${i.id},1)">+</button>
            </div></td>
            <td><strong>$${i.price*i.qty}</strong></td>
            <td><button class="del-btn" onclick="removeItem(${i.id})">✕</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
      <div class="nav-btns">
        <button class="btn-secondary-cp" onclick="currentStep=0;renderAll()">← Catálogo</button>
        <button class="btn-primary-cp" onclick="currentStep=2;renderAll()">Continuar →</button>
      </div>
    </div>
  </div>`;
  hideSideAction();
}

function changeQty(id,d){
  const i=cart.find(x=>x.id===id);
  if(i){i.qty=Math.max(1,i.qty+d);renderAll();}
}
function removeItem(id){
  cart=cart.filter(x=>x.id!==id);renderAll();
}

function renderShipping(mc){
  mc.innerHTML=`<div class="panel">
    <div class="panel-header"><h2>Método de Envío</h2><p>¿Cómo deseas recibir tu documentación?</p></div>
    <div class="panel-body">
      <div class="ship-options">
        ${SHIPPING.map(s=>`
          <div class="ship-opt ${shippingSelected===s.id?'selected':''}" onclick="selectShipping('${s.id}')">
            <input type="radio" name="ship" ${shippingSelected===s.id?'checked':''} readonly/>
            <div class="ship-opt-info">
              <div class="ship-opt-name">${s.name}</div>
              <div class="ship-opt-desc">${s.desc}</div>
            </div>
            <div class="ship-opt-price">${s.price===0?'Gratis':'$'+s.price}</div>
          </div>`).join('')}
      </div>
      <div class="nav-btns">
        <button class="btn-secondary-cp" onclick="currentStep=1;renderAll()">← Atrás</button>
        <button class="btn-primary-cp" onclick="if(shippingSelected){currentStep=3;renderAll()}else{alert('Selecciona un método de envío')}">Continuar →</button>
      </div>
    </div>
  </div>`;
  hideSideAction();
}

function selectShipping(id){shippingSelected=id;renderAll();}

function renderPayment(mc){
  mc.innerHTML=`<div class="panel">
    <div class="panel-header"><h2>Método de Pago</h2><p>Selecciona cómo deseas pagar tu plan</p></div>
    <div class="panel-body">
      <div class="pay-tabs">
        <button class="pay-tab ${payTabSelected==='card'?'active':''}" onclick="payTabSelected='card';renderAll()">💳 Tarjeta</button>
        <button class="pay-tab ${payTabSelected==='pse'?'active':''}" onclick="payTabSelected='pse';renderAll()">🏦 PSE</button>
        <button class="pay-tab ${payTabSelected==='wallet'?'active':''}" onclick="payTabSelected='wallet';renderAll()">📱 Billetera</button>
        <button class="pay-tab ${payTabSelected==='cash'?'active':''}" onclick="payTabSelected='cash';renderAll()">🏪 Efectivo</button>
      </div>
      ${payTabSelected==='card'?`
        <div class="pay-panel active">
          <div class="form-row single"><label>Número de tarjeta</label><input type="text" placeholder="1234 5678 9012 3456" maxlength="19"/></div>
          <div class="form-row single"><label>Nombre en la tarjeta</label><input type="text" placeholder="Como aparece en la tarjeta"/></div>
          <div class="form-row">
            <div><label>Vencimiento</label><input type="text" placeholder="MM/AA" maxlength="5"/></div>
            <div><label>CVV</label><input type="text" placeholder="123" maxlength="4"/></div>
          </div>
        </div>`:payTabSelected==='pse'?`
        <div class="pay-panel active">
          <div class="form-row single"><label>Banco</label>
            <div class="bank-grid">
              ${['Bancolombia','Davivienda','BBVA','Banco de Bogotá','Nequi','Banco Popular'].map(b=>`<button class="bank-btn ${bankSelected===b?'selected':''}" onclick="bankSelected='${b}';renderAll()">${b}</button>`).join('')}
            </div>
          </div>
          <div class="form-row single"><label>Tipo de persona</label><select><option>Persona Natural</option><option>Persona Jurídica</option></select></div>
          <div class="form-row single"><label>Número de documento</label><input type="text" placeholder="Cédula o NIT"/></div>
        </div>`:payTabSelected==='wallet'?`
        <div class="pay-panel active">
          <div class="wallet-grid">
            ${['Nequi','Daviplata','Rappi Pay','Movii'].map(w=>`<button class="wallet-btn ${walletSelected===w?'selected':''}" onclick="walletSelected='${w}';renderAll()">📱 ${w}</button>`).join('')}
          </div>
          ${walletSelected?`<div class="alert alert-info">Serás redirigido a ${walletSelected} para completar el pago de forma segura.</div>`:''}
        </div>`:`
        <div class="pay-panel active">
          <div class="cash-grid">
            ${['Efecty','Baloto','Corresponsal','Punto de pago'].map(c=>`<button class="cash-btn ${cashSelected===c?'selected':''}" onclick="cashSelected='${c}';renderAll()">${c}</button>`).join('')}
          </div>
          ${cashSelected?`<div class="reference-box"><p>Tu referencia de pago:</p><div class="ref-code">GS-${Math.floor(100000+Math.random()*900000)}</div><p style="font-size:12px;color:var(--gray-text);margin-top:8px">Válida por 48 horas. Presenta este código en ${cashSelected}.</p></div>`:''}
        </div>`}
      <div class="nav-btns">
        <button class="btn-secondary-cp" onclick="currentStep=2;renderAll()">← Atrás</button>
        <button class="btn-primary-cp" onclick="currentStep=4;renderAll()">Confirmar pago →</button>
      </div>
    </div>
  </div>`;
  hideSideAction();
}

function renderDocuments(mc){
  mc.innerHTML=`<div class="panel">
    <div class="panel-header"><h2>Documentos Requeridos</h2><p>Adjunta los documentos necesarios para activar tu plan</p></div>
    <div class="panel-body">
      <div class="alert alert-info">ℹPor regulación de la Superintendencia Financiera, debemos verificar tu identidad antes de activar el seguro.</div>
      <p class="section-title">Cédula de Ciudadanía</p>
      <div class="upload-zone" onclick="simulateUpload('cedula')">
        <input type="file" accept=".pdf,.jpg,.png"/>
        <div class="upload-icon"></div>
        <h3>Sube tu cédula</h3>
        <p>PDF, JPG o PNG · Máx. 5MB · Ambas caras</p>
      </div>
      ${uploadedDocs.cedula?`<div class="uploaded-file"><span class="file-icon">📄</span><span class="file-name">${uploadedDocs.cedula}</span><span class="file-size">2.3 MB</span><span class="file-ok">✓</span></div>`:''}
      <br/>
      <p class="section-title" style="margin-top:20px">Contrato firmado</p>
      <div class="upload-zone" onclick="simulateUpload('contrato')">
        <input type="file" accept=".pdf"/>
        <div class="upload-icon">📋</div>
        <h3>Sube el contrato</h3>
        <p>PDF firmado · Máx. 10MB</p>
      </div>
      ${uploadedDocs.contrato?`<div class="uploaded-file"><span class="file-icon">📋</span><span class="file-name">${uploadedDocs.contrato}</span><span class="file-size">1.1 MB</span><span class="file-ok">✓</span></div>`:''}
      <div class="nav-btns">
        <button class="btn-secondary-cp" onclick="currentStep=3;renderAll()">← Atrás</button>
        <button class="btn-primary-cp" onclick="currentStep=5;renderAll()">Finalizar →</button>
      </div>
    </div>
  </div>`;
  hideSideAction();
}

function simulateUpload(doc){
  const names={cedula:'cedula_ciudadania.pdf',contrato:'contrato_firmado.pdf'};
  uploadedDocs[doc]=names[doc];
  renderAll();
}

function renderConfirm(mc){
  const {total}=getTotal();
  const orderId='GS-'+Math.floor(100000+Math.random()*900000);
  mc.innerHTML=`<div class="panel">
    <div class="success-card">
      <div class="success-icon">🎉</div>
      <h2>¡Solicitud enviada con éxito!</h2>
      <p>Tu plan ha sido registrado. Un asesor te contactará en las próximas 24 horas hábiles para confirmar la activación.</p>
      <div class="order-info">
        <div class="order-info-item"><label>Número de orden</label><p>${orderId}</p></div>
        <div class="order-info-item"><label>Total mensual</label><p style="color:var(--blue)">$${total}/mes</p></div>
        <div class="order-info-item"><label>Planes contratados</label><p>${cart.map(i=>i.name).join(', ')}</p></div>
        <div class="order-info-item"><label>Método de envío</label><p>${SHIPPING.find(s=>s.id===shippingSelected)?.name||'—'}</p></div>
      </div>
      <button class="btn-primary-cp" style="width:auto;padding:14px 40px" onclick="resetFlow()">Volver al inicio</button>
    </div>
  </div>`;
  hideSideAction();
}

function resetFlow(){
  currentStep=0;cart=[];shippingSelected=null;payTabSelected='card';
  bankSelected=null;walletSelected=null;cashSelected=null;
  uploadedDocs={cedula:null,contrato:null};
  renderAll();
}

renderAll();