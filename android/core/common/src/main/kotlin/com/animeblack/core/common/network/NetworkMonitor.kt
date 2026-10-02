package com.animeblack.core.common.network

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import androidx.core.content.getSystemService
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.conflate
import kotlinx.coroutines.flow.distinctUntilChanged

/** Emits whether the device currently has an active internet connection. */
interface NetworkMonitor {
    val isOnline: Flow<Boolean>
    val isCurrentlyOnline: Boolean get() = true
}

@Singleton
class ConnectivityNetworkMonitor @Inject constructor(
    @ApplicationContext private val context: Context,
) : NetworkMonitor {

    override val isCurrentlyOnline: Boolean
        get() = context.getSystemService<ConnectivityManager>()?.isCurrentlyConnected() ?: true

    override val isOnline: Flow<Boolean> = callbackFlow {
        val cm = context.getSystemService<ConnectivityManager>()
        if (cm == null) {
            trySend(true)
            close()
            return@callbackFlow
        }
        val callback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                trySend(true)
            }

            override fun onCapabilitiesChanged(network: Network, networkCapabilities: NetworkCapabilities) {
                trySend(cm.isCurrentlyConnected())
            }

            override fun onLost(network: Network) {
                trySend(cm.isCurrentlyConnected())
            }
        }
        val request = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()
        try {
            cm.registerNetworkCallback(request, callback)
        } catch (_: Exception) {
            // Some OEM ROMs restrict registerNetworkCallback; default to connected.
        }
        trySend(cm.isCurrentlyConnected())
        awaitClose {
            try {
                cm.unregisterNetworkCallback(callback)
            } catch (_: Exception) {
            }
        }
    }.distinctUntilChanged().conflate()

    @Suppress("DEPRECATION")
    private fun ConnectivityManager.isCurrentlyConnected(): Boolean {
        val activeCaps = activeNetwork?.let { runCatching { getNetworkCapabilities(it) }.getOrNull() }
        if (activeCaps != null && (
                activeCaps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) ||
                    activeCaps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) ||
                    activeCaps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) ||
                    activeCaps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) ||
                    activeCaps.hasTransport(NetworkCapabilities.TRANSPORT_VPN)
                )
        ) {
            return true
        }
        val anyNet = runCatching {
            allNetworks.any { net ->
                val caps = getNetworkCapabilities(net)
                caps != null && (
                    caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) ||
                        caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) ||
                        caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) ||
                        caps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) ||
                        caps.hasTransport(NetworkCapabilities.TRANSPORT_VPN)
                    )
            }
        }.getOrDefault(false)
        if (anyNet) return true
        return runCatching { activeNetworkInfo?.isConnectedOrConnecting == true }.getOrDefault(true)
    }
}

@Module
@InstallIn(SingletonComponent::class)
abstract class NetworkMonitorModule {
    @Binds
    abstract fun bindsNetworkMonitor(impl: ConnectivityNetworkMonitor): NetworkMonitor
}
