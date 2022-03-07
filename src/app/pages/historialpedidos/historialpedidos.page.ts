import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { VendedorService } from 'src/app/services/vendedor.service';
import { ProductoService } from 'src/app/services/producto.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-historialpedidos',
  templateUrl: './historialpedidos.page.html',
  styleUrls: ['./historialpedidos.page.scss'],
})
export class HistorialpedidosPage implements OnInit {

  @Input() id_pedido
  nombre_empresa
  pedidos = []
  vendedores = []
  vendedoreSelected = []
  subtotalArray = []

  subtotalfinal = null;

  direccion: string;
  telefono: string;
  email: string;

  constructor(
    private modalCtrl: ModalController,
    private vendedorServ: VendedorService,
    private prodServ: ProductoService,
    private auth: AngularFireAuth,
  ) { }

  ngOnInit() {
    console.log('id_pedido',this.id_pedido.id)
    this.showEmpresa()
    this.subTotalFinal()
    this.showPedidoFinal()
    

  }

  subTotalFinal(){
    this.auth.onAuthStateChanged(user => {
      this.prodServ.getPedidoFinal(user.uid).subscribe(data => {
        data.map(item => {
          if(item.empresa_pedido === this.nombre_empresa){
            let subtotal = parseFloat(item.subtotal)
            this.subtotalArray.push(subtotal)
            this.subtotalfinal = this.subtotalArray.reduce((a,b) => a+b, 0)
            //console.log("subtotal final: "+this.subTotalFinal)
          }
        })
      })

     })
    
  }

  showEmpresa(){
    this.vendedorServ.getVendedor().subscribe(
      list => {
        this.vendedores = list.map(item => {
          return {
            $key: item.key,
            ...item.payload.val()
          }
        })
        this.vendedores.map(item => {
          
          if(item.nombre_empresa === this.nombre_empresa){
            this.direccion = item.direccion_vendedor
            this.telefono = item.telefono_vendedor
            this.email = item.email_vendedor
            console.log("direccion: "+this.direccion)
            console.log("telefono: "+this.telefono)
            console.log("email: "+this.email)
          }
        })
        
      }
    )
  }
fecha
  async showPedidoFinal()
  {
    this.auth.onAuthStateChanged(user => {
      this.prodServ.getPedidoFinal(user.uid).subscribe(data => {
        data.map((item) => {
          console.log("pedido: "+this.id_pedido, item.id_pedido)
          if(item.id_pedido === this.id_pedido){
            
            this.pedidos.push({
              cantidad_pedido: item.cantidad_pedido,
              categoria_pedido: item.categoria_pedido,
              empresa_pedido: item.empresa_pedido,
              id_pedido: item.id_pedido,
              id_prod: item.id_prod,
              imagen_pedido: item.imagen_pedido,
              nombre_pedido: item.nombre_pedido,
              precio_pedido: item.precio_pedido,
              fecha:item.fecha_pedido,
              email: this.email,
              telefono: this.telefono
            })
            
            this.fecha=item.fecha_pedido
            //console.log("length: "+this.fecha)
          }
         
        })
        console.log("length: "+this.fecha)
        document.getElementById('fecha').innerHTML+=' '+this.fecha
      })

     })
    
    
  }

  close(){
    this.modalCtrl.dismiss()
  }

}
