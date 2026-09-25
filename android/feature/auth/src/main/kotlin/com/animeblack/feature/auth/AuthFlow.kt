package com.animeblack.feature.auth

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.animeblack.core.navigation.ForgotPasswordRoute
import com.animeblack.core.navigation.LoginRoute
import com.animeblack.core.navigation.SignUpRoute

/**
 * Signed-out experience with its own back stack. The host swaps to the main graph as soon as
 * Firebase reports a signed-in user, so no authenticated screen is reachable from here.
 */
@Composable
fun AuthFlow(logoRes: Int?, prefillEmail: String? = null) {
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = LoginRoute) {
        composable<LoginRoute> {
            LoginScreen(
                onSignUp = { navController.navigate(SignUpRoute) },
                onForgot = { navController.navigate(ForgotPasswordRoute) },
                logoRes = logoRes,
                prefillEmail = prefillEmail,
            )
        }
        composable<SignUpRoute> {
            SignUpScreen(onSignIn = { navController.popBackStack() }, logoRes = logoRes)
        }
        composable<ForgotPasswordRoute> {
            ForgotPasswordScreen(onBack = { navController.popBackStack() })
        }
    }
}
